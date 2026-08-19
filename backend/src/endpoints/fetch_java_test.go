package endpoints

import (
	"bytes"
	"encoding/binary"
	"io"
	"net"
	"testing"
	"torch/src/utils"
)

func TestSendHandshakeUsesCurrentJavaProtocol(t *testing.T) {
	reader, writer := net.Pipe()
	defer reader.Close()
	defer writer.Close()

	sendResult := make(chan error, 1)
	go func() {
		sendResult <- sendHandshake(writer, "example.com", 25565)
	}()

	packetLength, _, err := utils.ReadVarInt(reader)
	if err != nil {
		t.Fatal(err)
	}
	packet := make([]byte, packetLength)
	if _, err := io.ReadFull(reader, packet); err != nil {
		t.Fatal(err)
	}
	if err := <-sendResult; err != nil {
		t.Fatal(err)
	}

	packetReader := bytes.NewReader(packet)
	packetID, _, err := utils.ReadVarInt(packetReader)
	if err != nil {
		t.Fatal(err)
	}
	protocolVersion, _, err := utils.ReadVarInt(packetReader)
	if err != nil {
		t.Fatal(err)
	}

	if packetID != 0 {
		t.Fatalf("unexpected handshake packet ID: %d", packetID)
	}
	if protocolVersion != 772 {
		t.Fatalf("unexpected Java protocol version: %d", protocolVersion)
	}
}

func TestReadStatusResponseRejectsTrailingPacketData(t *testing.T) {
	reader, writer := net.Pipe()
	defer reader.Close()
	defer writer.Close()

	sendResult := make(chan error, 1)
	go func() {
		packet := &bytes.Buffer{}
		utils.WriteVarInt(0, packet)
		utils.WriteString(`{"version":{"name":"1.21.8","protocol":772}}`, packet)
		packet.WriteByte(0xff)
		sendResult <- utils.WritePacket(packet, writer)
	}()

	if _, err := readStatusResponse(reader); err == nil {
		t.Fatal("expected trailing status data to be rejected")
	}
	if err := <-sendResult; err != nil {
		t.Fatal(err)
	}
}

func TestReadPongRejectsTrailingPacketData(t *testing.T) {
	const payload int64 = 42
	reader, writer := net.Pipe()
	defer reader.Close()
	defer writer.Close()

	sendResult := make(chan error, 1)
	go func() {
		packet := &bytes.Buffer{}
		utils.WriteVarInt(1, packet)
		binary.Write(packet, binary.BigEndian, payload)
		packet.WriteByte(0xff)
		sendResult <- utils.WritePacket(packet, writer)
	}()

	if err := readPong(reader, payload); err == nil {
		t.Fatal("expected trailing pong data to be rejected")
	}
	reader.Close()
	<-sendResult
}
