package endpoints

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"io"
	"net"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"torch/src/structs"

	"github.com/gin-gonic/gin"
)

var bedrockMagic = []byte{0x00, 0xFF, 0xFF, 0x00, 0xFE, 0xFE, 0xFE, 0xFE, 0xFD, 0xFD, 0xFD, 0xFD, 0x12, 0x34, 0x56, 0x78}

func fetchBedrock(host string, port uint16) (*structs.BedrockStatus, error) {
	conn, err := net.DialTimeout("udp", net.JoinHostPort(host, strconv.Itoa(int(port))), statusTimeout)
	if err != nil {
		return nil, err
	}
	defer conn.Close()

	if err = conn.SetDeadline(time.Now().Add(statusTimeout)); err != nil {
		return nil, err
	}

	pingTime := time.Now().UnixMilli()
	pingStart := time.Now()
	buf := &bytes.Buffer{}
	if err := buf.WriteByte(0x01); err != nil {
		return nil, err
	}
	if err := binary.Write(buf, binary.BigEndian, pingTime); err != nil {
		return nil, err
	}
	if _, err := buf.Write(bedrockMagic); err != nil {
		return nil, err
	}
	if err := binary.Write(buf, binary.BigEndian, uint64(time.Now().UnixNano())); err != nil {
		return nil, err
	}
	if _, err := conn.Write(buf.Bytes()); err != nil {
		return nil, err
	}

	packet := make([]byte, 65535)
	packetLength, err := conn.Read(packet)
	if err != nil {
		return nil, err
	}

	return parseBedrockPong(packet[:packetLength], pingTime, host, port, pingStart)
}

func parseBedrockPong(packet []byte, expectedPingTime int64, host string, port uint16, pingStart time.Time) (*structs.BedrockStatus, error) {
	reader := bytes.NewReader(packet)

	packetID, err := reader.ReadByte()
	if err != nil {
		return nil, err
	}
	if packetID != 0x1C {
		return nil, fmt.Errorf("unexpected packet ID (expected 0x1c, got 0x%02x)", packetID)
	}

	var pingTime int64
	if err := binary.Read(reader, binary.BigEndian, &pingTime); err != nil {
		return nil, err
	}
	if pingTime != expectedPingTime {
		return nil, fmt.Errorf("unexpected ping time (expected %d, got %d)", expectedPingTime, pingTime)
	}

	var serverGUID uint64
	if err := binary.Read(reader, binary.BigEndian, &serverGUID); err != nil {
		return nil, err
	}

	magic := make([]byte, len(bedrockMagic))
	if _, err := io.ReadFull(reader, magic); err != nil {
		return nil, err
	}
	if !bytes.Equal(magic, bedrockMagic) {
		return nil, fmt.Errorf("unexpected RakNet magic")
	}
	if reader.Len() == 0 {
		return nil, fmt.Errorf("Bedrock pong did not include a server advertisement")
	}

	var advertisementLength uint16
	if err := binary.Read(reader, binary.BigEndian, &advertisementLength); err != nil {
		return nil, err
	}
	if int(advertisementLength) > reader.Len() {
		return nil, fmt.Errorf("Bedrock advertisement length %d exceeds the remaining datagram", advertisementLength)
	}

	advertisement := make([]byte, advertisementLength)
	if _, err := io.ReadFull(reader, advertisement); err != nil {
		return nil, err
	}
	if reader.Len() != 0 {
		return nil, fmt.Errorf("Bedrock pong contains %d unexpected trailing bytes", reader.Len())
	}
	if !utf8.Valid(advertisement) {
		return nil, fmt.Errorf("Bedrock advertisement is not valid UTF-8")
	}

	return parseBedrockAdvertisement(
		string(advertisement),
		strconv.FormatUint(serverGUID, 10),
		host,
		port,
		time.Since(pingStart),
	)
}

func parseBedrockAdvertisement(advertisement string, serverGUID string, host string, port uint16, latency time.Duration) (*structs.BedrockStatus, error) {
	fields := strings.Split(advertisement, ";")
	if len(fields) < 6 {
		return nil, fmt.Errorf("Bedrock advertisement has %d fields; expected at least 6", len(fields))
	}

	protocol, err := parseRequiredBedrockInt(fields[2], "protocol")
	if err != nil {
		return nil, err
	}
	online, err := parseRequiredBedrockInt(fields[4], "online players")
	if err != nil {
		return nil, err
	}
	maxPlayers, err := parseRequiredBedrockInt(fields[5], "max players")
	if err != nil {
		return nil, err
	}

	versionName := bedrockField(fields, 3)
	motdLines := []string{bedrockField(fields, 1)}
	if len(fields) > 7 {
		motdLines = append(motdLines, fields[7])
	}

	now := time.Now()
	status := &structs.BedrockStatus{
		ServerGUID: serverGUID,
		Version: structs.Version{
			Name:     structs.ParseBedrock([]string{versionName}, versionName),
			Protocol: protocol,
		},
		Edition:       bedrockField(fields, 0),
		MOTD:          structs.ParseBedrock(motdLines, versionName),
		Players:       structs.Players{Max: maxPlayers, Online: online},
		ServerID:      bedrockField(fields, 6),
		Gamemode:      bedrockField(fields, 8),
		GamemodeId:    parseOptionalBedrockInt(bedrockField(fields, 9)),
		Port:          port,
		PortIPv4:      parseOptionalBedrockPort(bedrockField(fields, 10)),
		PortIPv6:      parseOptionalBedrockPort(bedrockField(fields, 11)),
		Host:          host,
		Advertisement: advertisement,
		ObtainedAt:    now,
		ExpiresAt:     now.Add(statusCacheTime),
		Latency:       time.Duration(latency.Milliseconds()),
	}

	return status, nil
}

func parseRequiredBedrockInt(value string, name string) (int, error) {
	parsed, err := strconv.ParseInt(strings.TrimSpace(value), 10, 32)
	if err != nil {
		return 0, fmt.Errorf("invalid Bedrock %s %q: %w", name, value, err)
	}
	return int(parsed), nil
}

func parseOptionalBedrockInt(value string) int {
	parsed, err := strconv.ParseInt(strings.TrimSpace(value), 10, 32)
	if err != nil {
		return 0
	}
	return int(parsed)
}

func parseOptionalBedrockPort(value string) *int {
	parsed := parseOptionalBedrockInt(value)
	if parsed < 1 || parsed > 65535 {
		return nil
	}
	return &parsed
}

func bedrockField(fields []string, index int) string {
	if index >= len(fields) {
		return ""
	}
	return fields[index]
}

func FetchBedrockHandler(c *gin.Context) {
	host, _, port, err := parseProbeAddress(c.Param("ip"))
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	fetchedData, err := getBedrockStatus(host, port)
	if err != nil {
		c.JSON(200, structs.OfflineServer{
			Offline: true,
			Host:    host,
			Port:    port,
		})
		return
	}

	c.JSON(200, fetchedData)
}
