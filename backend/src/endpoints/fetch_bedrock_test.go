package endpoints

import (
	"bytes"
	"encoding/binary"
	"strconv"
	"testing"
	"time"
)

func TestParseBedrockPongPreservesModernAdvertisement(t *testing.T) {
	const pingTime int64 = 0x0102030405060708
	const serverGUID uint64 = 0xfedcba9876543210
	advertisement := "MCPE;§aLine 1;2168;1.26.44;10;100;123;§l§mLine 2;Survival;1;19132;19133;future"

	status, err := parseBedrockPong(
		bedrockPongPacket(pingTime, serverGUID, advertisement, nil),
		pingTime,
		"example.com",
		19132,
		time.Now(),
	)
	if err != nil {
		t.Fatal(err)
	}

	if status.ServerGUID != strconv.FormatUint(serverGUID, 10) {
		t.Fatalf("unexpected server GUID: %s", status.ServerGUID)
	}
	if status.Version.Protocol != 2168 || status.Version.Name.Clean != "1.26.44" {
		t.Fatalf("unexpected version: %#v", status.Version)
	}
	if status.MOTD.Clean != "Line 1\nLine 2" {
		t.Fatalf("unexpected MOTD: %q", status.MOTD.Clean)
	}
	if status.PortIPv4 == nil || *status.PortIPv4 != 19132 {
		t.Fatalf("unexpected IPv4 port: %#v", status.PortIPv4)
	}
	if status.Advertisement != advertisement {
		t.Fatal("raw advertisement was not preserved")
	}
}

func TestParseBedrockPongRejectsTrailingDatagramData(t *testing.T) {
	const pingTime int64 = 42
	packet := bedrockPongPacket(
		pingTime,
		7,
		"MCPE;Server;2168;1.26.44;1;10",
		[]byte{0xff},
	)

	if _, err := parseBedrockPong(packet, pingTime, "example.com", 19132, time.Now()); err == nil {
		t.Fatal("expected trailing datagram data to be rejected")
	}
}

func TestParseBedrockAdvertisementToleratesMalformedOptionalPorts(t *testing.T) {
	status, err := parseBedrockAdvertisement(
		"MCPE;Server;2168;1.26.44;1;10;123;Second line;Survival;1;bad;",
		"123",
		"example.com",
		19132,
		0,
	)
	if err != nil {
		t.Fatal(err)
	}
	if status.PortIPv4 != nil || status.PortIPv6 != nil {
		t.Fatalf("unexpected optional ports: %#v %#v", status.PortIPv4, status.PortIPv6)
	}
}

func bedrockPongPacket(pingTime int64, serverGUID uint64, advertisement string, trailing []byte) []byte {
	packet := &bytes.Buffer{}
	packet.WriteByte(0x1c)
	binary.Write(packet, binary.BigEndian, pingTime)
	binary.Write(packet, binary.BigEndian, serverGUID)
	packet.Write(bedrockMagic)
	binary.Write(packet, binary.BigEndian, uint16(len(advertisement)))
	packet.WriteString(advertisement)
	packet.Write(trailing)
	return packet.Bytes()
}
