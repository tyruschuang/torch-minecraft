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

func TestParseLegacyFormattingPreservesAmpersandsAndWhitespace(t *testing.T) {
	parsed := Parse("§f  §6§lTORRHUS & SAFARI §7| §e§lSUMMER EVENT")

	if parsed.Clean != "  TORRHUS & SAFARI | SUMMER EVENT" {
		t.Fatalf("unexpected clean text: %q", parsed.Clean)
	}

	assertSegmentStyles(t, parsed.Segments, "TORRHUS & SAFARI ", "color=#ffaa00", "bold")
	assertSegmentStyles(t, parsed.Segments, "| ", "color=#aaaaaa")
	assertSegmentStyles(t, parsed.Segments, "SUMMER EVENT", "color=#ffff55", "bold")
}

func TestParseLegacyHexColor(t *testing.T) {
	parsed := Parse("§x§1§2§A§B§3§4RGB")

	assertSegmentStyles(t, parsed.Segments, "RGB", "color=#12ab34")
}

func TestParseModernComponentsInheritAndOverrideFormatting(t *testing.T) {
	parsed := Parse(map[string]interface{}{
		"text":  "Root",
		"color": "#12ab34",
		"bold":  true,
		"extra": []interface{}{
			" child",
			map[string]interface{}{
				"text":       " plain",
				"bold":       false,
				"underlined": true,
			},
		},
	})

	assertSegmentStyles(t, parsed.Segments, "Root child", "color=#12ab34", "bold")
	assertSegmentStyles(t, parsed.Segments, " plain", "color=#12ab34", "underline")
	assertSegmentOmitsStyle(t, parsed.Segments, " plain", "bold")
}

func TestParseComponentArrayInheritsFirstStyle(t *testing.T) {
	parsed := Parse([]interface{}{
		map[string]interface{}{"text": "A", "color": "red"},
		"B",
	})

	assertSegmentStyles(t, parsed.Segments, "AB", "color=#ff5555")
}

func TestParseMissingComponentReturnsEmptyText(t *testing.T) {
	parsed := Parse(nil)

	if parsed == nil || parsed.Clean != "" || len(parsed.Segments) != 1 {
		t.Fatalf("unexpected empty parsed text: %#v", parsed)
	}
}

func assertSegmentStyles(t *testing.T, segments []JsonSegment, text string, styles ...string) {
	t.Helper()

	for _, segment := range segments {
		if segment.Text != text {
			continue
		}
		for _, style := range styles {
			if !contains(segment.Styles, style) {
				t.Fatalf("segment %q is missing style %q: %#v", text, style, segment.Styles)
			}
		}
		return
	}

	t.Fatalf("segment %q was not found in %#v", text, segments)
}

func assertSegmentOmitsStyle(t *testing.T, segments []JsonSegment, text string, style string) {
	t.Helper()

	for _, segment := range segments {
		if segment.Text == text && contains(segment.Styles, style) {
			t.Fatalf("segment %q unexpectedly contains style %q", text, style)
		}
	}
}

func contains(values []string, expected string) bool {
	for _, value := range values {
		if value == expected {
			return true
		}
	}
	return false
}
