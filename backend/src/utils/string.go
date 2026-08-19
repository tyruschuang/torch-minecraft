package utils

import (
	"fmt"
	"io"
)

const maxStringLength = 1 << 20

func ReadString(r io.Reader) ([]byte, error) {
	length, _, err := ReadVarInt(r)
	if err != nil {
		return nil, err
	}
	if length < 0 || length > maxStringLength {
		return nil, fmt.Errorf("string length %d is outside the supported range", length)
	}
	data := make([]byte, length)
	if _, err := io.ReadFull(r, data); err != nil {
		return nil, err
	}
	return data, nil
}

func WriteString(val string, w io.Writer) error {
	if _, err := WriteVarInt(int32(len(val)), w); err != nil {
		return err
	}
	_, err := w.Write([]byte(val))
	return err
}
