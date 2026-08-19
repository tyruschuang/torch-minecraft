package utils

import (
	"bytes"
	"fmt"
	"io"
)

func WritePacket(data *bytes.Buffer, writer io.Writer) error {
	if _, err := WriteVarInt(int32(data.Len()), writer); err != nil {
		return err
	}
	_, err := io.Copy(writer, data)
	return err
}

func ReadPacket(reader io.Reader, maxLength int32) (*bytes.Reader, error) {
	length, _, err := ReadVarInt(reader)
	if err != nil {
		return nil, err
	}
	if length < 0 || length > maxLength {
		return nil, fmt.Errorf("packet length %d is outside the supported range", length)
	}

	data := make([]byte, length)
	if _, err := io.ReadFull(reader, data); err != nil {
		return nil, err
	}
	return bytes.NewReader(data), nil
}
