package endpoints

import (
	"bytes"
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
