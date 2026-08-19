package utils

import (
	"fmt"
	"io"
	"unicode/utf16"
	"unicode/utf8"
)

const maxStringBytes = 32767 * 3
const maxStringCodeUnits = 32767

func ReadString(r io.Reader) ([]byte, error) {
	length, _, err := ReadVarInt(r)
	if err != nil {
		return nil, err
	}
	if length < 0 || length > maxStringBytes {
		return nil, fmt.Errorf("string length %d is outside the supported range", length)
	}
	data := make([]byte, length)
	if _, err := io.ReadFull(r, data); err != nil {
		return nil, err
	}
	if !utf8.Valid(data) {
		return nil, fmt.Errorf("string is not valid UTF-8")
	}
	if len(utf16.Encode([]rune(string(data)))) > maxStringCodeUnits {
		return nil, fmt.Errorf("string exceeds %d UTF-16 code units", maxStringCodeUnits)
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
