package utils

import (
	"bytes"
	"testing"
)

func TestReadPacketHonorsDeclaredBoundary(t *testing.T) {
	wire := &bytes.Buffer{}
	WriteVarInt(2, wire)
	wire.Write([]byte{0x01, 0x02, 0x03})

	packet, err := ReadPacket(wire, 16)
	if err != nil {
		t.Fatal(err)
	}
	if packet.Len() != 2 || wire.Len() != 1 {
		t.Fatalf("packet boundary was not preserved: packet=%d wire=%d", packet.Len(), wire.Len())
	}
}

func TestReadPacketRejectsOversizedLength(t *testing.T) {
	wire := &bytes.Buffer{}
	WriteVarInt(17, wire)

	if _, err := ReadPacket(wire, 16); err == nil {
		t.Fatal("expected oversized packet to be rejected")
	}
}

func TestReadStringRejectsInvalidUTF8(t *testing.T) {
	wire := &bytes.Buffer{}
	WriteVarInt(1, wire)
	wire.WriteByte(0xff)

	if _, err := ReadString(wire); err == nil {
		t.Fatal("expected invalid UTF-8 to be rejected")
	}
}

func TestReadStringRejectsNegativeLength(t *testing.T) {
	wire := &bytes.Buffer{}
	WriteVarInt(-1, wire)

	if _, err := ReadString(wire); err == nil {
		t.Fatal("expected negative string length to be rejected")
	}
}
