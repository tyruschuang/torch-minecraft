package structs

import (
	"strings"
	"testing"
)

func TestParseEscapesServerHTML(t *testing.T) {
	parsed := Parse(`§aSafe <img src=x onerror="alert(1)"> & text`)

	if strings.Contains(parsed.Html, "<img") {
		t.Fatal("server HTML was not escaped")
	}
	if !strings.Contains(parsed.Html, "&lt;img") {
		t.Fatal("escaped server text is missing from HTML output")
	}
	if !strings.Contains(parsed.Html, "color: #55ff55") {
		t.Fatal("Minecraft formatting was not preserved")
	}
}
