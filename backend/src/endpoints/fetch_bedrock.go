package endpoints

import (
	"bufio"
	"bytes"
	"encoding/binary"
	"fmt"
	"io"
	"net"
	"strconv"
	"strings"
	"time"

	"torch/src/structs"

	"github.com/gin-gonic/gin"
)

var bedrockMagic = []byte{0x00, 0xFF, 0xFF, 0x00, 0xFE, 0xFE, 0xFE, 0xFE, 0xFD, 0xFD, 0xFD, 0xFD, 0x12, 0x34, 0x56, 0x78}

func fetchBedrock(host string, port uint16) (*structs.BedrockStatus, error) {
	conn, err := net.DialTimeout("udp", fmt.Sprintf("%s:%d", host, port), statusTimeout)
	if err != nil {
		return nil, err
	}
	defer conn.Close()

	if err = conn.SetDeadline(time.Now().Add(statusTimeout)); err != nil {
		return nil, err
	}

	reader := bufio.NewReader(conn)
	pingStart := time.Now()

	buf := &bytes.Buffer{}
	if err := buf.WriteByte(0x01); err != nil {
		return nil, err
	}
	if err := binary.Write(buf, binary.BigEndian, time.Now().UnixMilli()); err != nil {
		return nil, err
	}
	if _, err := buf.Write(bedrockMagic); err != nil {
		return nil, err
	}
	if err := binary.Write(buf, binary.BigEndian, uint64(0)); err != nil {
		return nil, err
	}

	if _, err := io.Copy(conn, buf); err != nil {
		return nil, err
	}

	var packetId byte
	var pingTime, serverGUID int64
	var serverNameLength uint16

	if err := binary.Read(reader, binary.BigEndian, &packetId); err != nil {
		return nil, err
	}
	if packetId != 0x1C {
		return nil, fmt.Errorf("unexpected packet ID (expected 0x1c, got 0x%02x)", packetId)
	}
	if err := binary.Read(reader, binary.BigEndian, &pingTime); err != nil {
		return nil, err
	}
	if err := binary.Read(reader, binary.BigEndian, &serverGUID); err != nil {
		return nil, err
	}
	data := make([]byte, 16)
	if _, err := io.ReadFull(reader, data); err != nil {
		return nil, err
	}
	if !bytes.Equal(data, bedrockMagic) {
		return nil, fmt.Errorf("unexpected RakNet magic")
	}
	if err := binary.Read(reader, binary.BigEndian, &serverNameLength); err != nil {
		return nil, err
	}
	serverName := make([]byte, serverNameLength)
	if _, err := io.ReadFull(reader, serverName); err != nil {
		return nil, err
	}

	split := strings.Split(string(serverName), ";")

	var status structs.BedrockStatus
	var _value int64
	var _motd string

	for key, value := range split {
		if len(strings.Trim(value, " ")) < 1 {
			continue
		}

		switch key {
		case 0:
			status.Edition = value
		case 1:
			_motd = value
		case 2:
			_value, err = strconv.ParseInt(value, 10, 64)
			if err != nil {
				return nil, err
			}
			status.Version.Protocol = int(_value)
		case 3:
			status.Version.Name = structs.Parse(value)
		case 4:
			_value, err = strconv.ParseInt(value, 10, 64)
			if err != nil {
				return nil, err
			}
			status.Players.Online = int(_value)
		case 5:
			_value, err = strconv.ParseInt(value, 10, 64)
			if err != nil {
				return nil, err
			}
			status.Players.Max = int(_value)
		case 6:
			status.ServerID = value
		case 7:
			_motd += "\n&r" + value
		case 8:
			status.Gamemode = value
		case 9:
			_value, err = strconv.ParseInt(value, 10, 64)
			if err != nil {
				return nil, err
			}
			status.GamemodeId = int(_value)
		case 10:
			_value, err = strconv.ParseInt(value, 10, 64)
			if err != nil {
				return nil, err
			}
			intValue := int(_value)
			status.PortIPv4 = &intValue
		case 11:
			_value, err = strconv.ParseInt(value, 10, 64)
			if err != nil {
				return nil, err
			}
			intValue := int(_value)
			status.PortIPv6 = &intValue
		}
	}

	if len(_motd) > 0 {
		status.MOTD = structs.Parse(_motd)
	}
	status.ServerGUID = serverGUID
	status.Host = host
	status.Port = port
	status.ObtainedAt = time.Now()
	status.ExpiresAt = time.Now().Add(time.Duration(statusCacheTime))
	status.Latency = time.Duration(time.Since(pingStart).Milliseconds())

	return &status, nil
}

func FetchBedrockHandler(c *gin.Context) {
	ip := c.Param("ip")
	port := 19132

	if strings.Contains(ip, ":") {
		split := strings.SplitN(ip, ":", 2)
		ip = split[0]
		p, err := strconv.Atoi(split[1])
		if err == nil && p > 0 && p <= 65535 {
			port = p
		}
	}

	uintPort := uint16(port)

	cacheKey := fmt.Sprintf("%s:%d", ip, port)
	data, err := bedrockCache.Value(cacheKey)
	if err == nil {
		c.JSON(200, data.Data().(*structs.BedrockStatus))
		return
	}

	fetchedData, err := fetchBedrock(ip, uintPort)
	if err != nil {
		c.JSON(200, structs.OfflineServer{
			Offline: true,
			Host:    ip,
			Port:    uintPort,
		})
		return
	}

	bedrockCache.Add(cacheKey, statusCacheTime, fetchedData)
	c.JSON(200, fetchedData)
}
