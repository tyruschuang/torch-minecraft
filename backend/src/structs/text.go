package structs

import (
	"encoding/json"
	"fmt"
	stdhtml "html"
	"regexp"
	"strconv"
	"strings"
	"torch/src/utils"
)

var hexColorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

type ParsedText struct {
	Raw      string        `json:"raw"`
	Clean    string        `json:"clean"`
	Html     string        `json:"html"`
	Json     string        `json:"json"`
	Segments []JsonSegment `json:"segments"`
}

type JsonSegment struct {
	Text   string   `json:"text"`
	Styles []string `json:"styles"`
}

type textStyle struct {
	Color         string
	Bold          bool
	Italic        bool
	Underlined    bool
	Strikethrough bool
	Obfuscated    bool
	Font          string
	ShadowColor   string
}

type styledSegment struct {
	Text  string
	Style textStyle
}

func Parse(object interface{}) *ParsedText {
	styledSegments := make([]styledSegment, 0)
	appendComponent(&styledSegments, object, textStyle{})

	if len(styledSegments) == 0 {
		styledSegments = append(styledSegments, styledSegment{})
	}

	segments := make([]JsonSegment, 0, len(styledSegments))
	clean := strings.Builder{}
	for _, segment := range styledSegments {
		segments = append(segments, JsonSegment{
			Text:   segment.Text,
			Styles: segment.Style.tokens(),
		})
		clean.WriteString(segment.Text)
	}

	raw, ok := object.(string)
	if !ok {
		raw = clean.String()
	}

	return &ParsedText{
		Raw:      raw,
		Clean:    clean.String(),
		Html:     segmentsHTML(styledSegments),
		Json:     segmentsJSON(segments),
		Segments: segments,
	}
}

func appendComponent(segments *[]styledSegment, component interface{}, inherited textStyle) {
	switch value := component.(type) {
	case nil:
		return
	case string:
		appendLegacyText(segments, value, inherited)
	case []interface{}:
		if len(value) == 0 {
			return
		}

		appendComponent(segments, value[0], inherited)
		childStyle := componentStyle(value[0], inherited)
		for _, child := range value[1:] {
			appendComponent(segments, child, childStyle)
		}
	case map[string]interface{}:
		style := applyComponentStyle(inherited, value)
		appendComponentContent(segments, value, style)

		if children, ok := value["extra"].([]interface{}); ok {
			for _, child := range children {
				appendComponent(segments, child, style)
			}
		}
	case json.Number:
		appendStyledText(segments, value.String(), inherited)
	case float64, bool:
		appendStyledText(segments, fmt.Sprint(value), inherited)
	}
}

func appendComponentContent(segments *[]styledSegment, component map[string]interface{}, style textStyle) {
	if text, ok := component["text"].(string); ok {
		appendLegacyText(segments, text, style)
		return
	}

	if translation, ok := component["translate"].(string); ok {
		template := translation
		if fallback, ok := component["fallback"].(string); ok && fallback != "" {
			template = fallback
		}

		arguments, _ := component["with"].([]interface{})
		appendTranslation(segments, template, arguments, style)
		return
	}

	if score, ok := component["score"].(map[string]interface{}); ok {
		if value, ok := score["value"].(string); ok {
			appendLegacyText(segments, value, style)
		}
		return
	}

	for _, key := range []string{"selector", "keybind", "nbt"} {
		if value, ok := component[key].(string); ok {
			appendLegacyText(segments, value, style)
			return
		}
	}
}

func appendTranslation(segments *[]styledSegment, template string, arguments []interface{}, style textStyle) {
	nextArgument := 0
	for cursor := 0; cursor < len(template); {
		percentOffset := strings.IndexByte(template[cursor:], '%')
		if percentOffset < 0 {
			appendLegacyText(segments, template[cursor:], style)
			return
		}

		percent := cursor + percentOffset
		appendLegacyText(segments, template[cursor:percent], style)

		if percent+1 < len(template) && template[percent+1] == '%' {
			appendStyledText(segments, "%", style)
			cursor = percent + 2
			continue
		}

		argumentIndex, consumed, ok := translationArgument(template[percent:])
		if !ok {
			appendStyledText(segments, "%", style)
			cursor = percent + 1
			continue
		}

		if argumentIndex < 0 {
			argumentIndex = nextArgument
			nextArgument++
		}
		if argumentIndex < len(arguments) {
			appendComponent(segments, arguments[argumentIndex], style)
		}
		cursor = percent + consumed
	}
}

func translationArgument(value string) (index int, consumed int, ok bool) {
	if len(value) >= 2 && value[0] == '%' && value[1] == 's' {
		return -1, 2, true
	}

	digitEnd := 1
	for digitEnd < len(value) && value[digitEnd] >= '0' && value[digitEnd] <= '9' {
		digitEnd++
	}
	if digitEnd == 1 || digitEnd+1 >= len(value) || value[digitEnd] != '$' || value[digitEnd+1] != 's' {
		return 0, 0, false
	}

	parsedIndex, err := strconv.Atoi(value[1:digitEnd])
	if err != nil || parsedIndex < 1 {
		return 0, 0, false
	}
	return parsedIndex - 1, digitEnd + 2, true
}

func componentStyle(component interface{}, inherited textStyle) textStyle {
	switch value := component.(type) {
	case map[string]interface{}:
		return applyComponentStyle(inherited, value)
	case []interface{}:
		if len(value) > 0 {
			return componentStyle(value[0], inherited)
		}
	}
	return inherited
}

func applyComponentStyle(inherited textStyle, component map[string]interface{}) textStyle {
	style := inherited

	if value, exists := component["color"]; exists {
		if color, ok := parseTextColor(value); ok {
			style.Color = color
		}
	}
	if value, ok := component["bold"].(bool); ok {
		style.Bold = value
	}
	if value, ok := component["italic"].(bool); ok {
		style.Italic = value
	}
	if value, ok := component["underlined"].(bool); ok {
		style.Underlined = value
	}
	if value, ok := component["strikethrough"].(bool); ok {
		style.Strikethrough = value
	}
	if value, ok := component["obfuscated"].(bool); ok {
		style.Obfuscated = value
	}
	if value, ok := component["font"].(string); ok {
		style.Font = value
	}
	if value, exists := component["shadow_color"]; exists {
		style.ShadowColor = parseShadowColor(value)
	}

	return style
}

func appendLegacyText(segments *[]styledSegment, value string, inherited textStyle) {
	runes := []rune(value)
	style := inherited
	text := strings.Builder{}

	flush := func() {
		if text.Len() == 0 {
			return
		}
		appendStyledText(segments, text.String(), style)
		text.Reset()
	}

	for index := 0; index < len(runes); {
		marker := runes[index]
		if marker != '§' && marker != '&' {
			text.WriteRune(marker)
			index++
			continue
		}

		if color, consumed, ok := legacyHexColor(runes, index); ok {
			flush()
			style = resetDecorations(style, inherited)
			style.Color = color
			index += consumed
			continue
		}

		if index+1 >= len(runes) {
			text.WriteRune(marker)
			index++
			continue
		}

		code := rune(strings.ToLower(string(runes[index+1]))[0])
		if !isLegacyCode(code) {
			text.WriteRune(marker)
			index++
			continue
		}

		flush()
		style = applyLegacyCode(style, inherited, code)
		index += 2
	}

	flush()
}

func legacyHexColor(runes []rune, index int) (string, int, bool) {
	if index+7 < len(runes) && runes[index+1] == '#' {
		digits := runes[index+2 : index+8]
		if allHex(digits) {
			return "#" + strings.ToLower(string(digits)), 8, true
		}
	}

	if index+13 >= len(runes) || (runes[index+1] != 'x' && runes[index+1] != 'X') {
		return "", 0, false
	}

	digits := make([]rune, 0, 6)
	for offset := 0; offset < 6; offset++ {
		markerIndex := index + 2 + offset*2
		digitIndex := markerIndex + 1
		if (runes[markerIndex] != '§' && runes[markerIndex] != '&') || !isHex(runes[digitIndex]) {
			return "", 0, false
		}
		digits = append(digits, runes[digitIndex])
	}

	return "#" + strings.ToLower(string(digits)), 14, true
}

func applyLegacyCode(style textStyle, inherited textStyle, code rune) textStyle {
	if color, ok := utils.ParseColor(string(code)); ok {
		style = resetDecorations(style, inherited)
		style.Color = color.ToHex()
		return style
	}

	switch code {
	case 'k':
		style.Obfuscated = true
	case 'l':
		style.Bold = true
	case 'm':
		style.Strikethrough = true
	case 'n':
		style.Underlined = true
	case 'o':
		style.Italic = true
	case 'r':
		style = inherited
	}
	return style
}

func resetDecorations(style textStyle, inherited textStyle) textStyle {
	return textStyle{
		Font:        style.Font,
		ShadowColor: style.ShadowColor,
		Color:       inherited.Color,
	}
}

func appendStyledText(segments *[]styledSegment, text string, style textStyle) {
	if text == "" {
		return
	}

	if len(*segments) > 0 && (*segments)[len(*segments)-1].Style == style {
		(*segments)[len(*segments)-1].Text += text
		return
	}

	*segments = append(*segments, styledSegment{Text: text, Style: style})
}

func parseTextColor(value interface{}) (string, bool) {
	colorName, ok := value.(string)
	if !ok {
		return "", false
	}
	if strings.EqualFold(colorName, "reset") {
		return "", true
	}
	if hexColorPattern.MatchString(colorName) {
		return strings.ToLower(colorName), true
	}
	if color, ok := utils.ParseColor(colorName); ok {
		return color.ToHex(), true
	}
	return "", false
}

func parseShadowColor(value interface{}) string {
	switch color := value.(type) {
	case float64:
		return argbToHex(uint32(int64(color)))
	case json.Number:
		number, err := strconv.ParseInt(color.String(), 10, 64)
		if err == nil {
			return argbToHex(uint32(number))
		}
	case []interface{}:
		if len(color) != 4 {
			return ""
		}

		components := make([]uint8, 4)
		for index, raw := range color {
			number, ok := raw.(float64)
			if !ok || number < 0 || number > 1 {
				return ""
			}
			components[index] = uint8(number*255 + 0.5)
		}
		return fmt.Sprintf("#%02x%02x%02x%02x", components[0], components[1], components[2], components[3])
	}
	return ""
}

func argbToHex(color uint32) string {
	alpha := uint8(color >> 24)
	red := uint8(color >> 16)
	green := uint8(color >> 8)
	blue := uint8(color)
	return fmt.Sprintf("#%02x%02x%02x%02x", red, green, blue, alpha)
}

func (style textStyle) tokens() []string {
	tokens := make([]string, 0, 8)
	if style.Color != "" {
		tokens = append(tokens, "color="+style.Color)
	}
	if style.Bold {
		tokens = append(tokens, "bold")
	}
	if style.Italic {
		tokens = append(tokens, "italic")
	}
	if style.Underlined {
		tokens = append(tokens, "underline")
	}
	if style.Strikethrough {
		tokens = append(tokens, "strikethrough")
	}
	if style.Obfuscated {
		tokens = append(tokens, "obfuscated")
	}
	if style.Font != "" {
		tokens = append(tokens, "font="+style.Font)
	}
	if style.ShadowColor != "" {
		tokens = append(tokens, "shadow="+style.ShadowColor)
	}
	return tokens
}

func segmentsJSON(segments []JsonSegment) string {
	indexed := make(map[string]JsonSegment, len(segments))
	for index, segment := range segments {
		indexed[strconv.Itoa(index+1)] = segment
	}
	output, _ := json.Marshal(indexed)
	return string(output)
}

func segmentsHTML(segments []styledSegment) string {
	output := strings.Builder{}
	output.WriteString("<span>")

	for _, segment := range segments {
		styles := strings.Builder{}
		if segment.Style.Color != "" {
			styles.WriteString("color: " + segment.Style.Color + "; ")
		}
		if segment.Style.Bold {
			styles.WriteString("font-weight: bold; ")
		}
		if segment.Style.Italic {
			styles.WriteString("font-style: italic; ")
		}

		decorations := make([]string, 0, 2)
		if segment.Style.Underlined {
			decorations = append(decorations, "underline")
		}
		if segment.Style.Strikethrough {
			decorations = append(decorations, "line-through")
		}
		if len(decorations) > 0 {
			styles.WriteString("text-decoration: " + strings.Join(decorations, " ") + "; ")
		}

		class := ""
		if segment.Style.Obfuscated {
			class = ` class="minecraft-obfuscated"`
		}

		text := stdhtml.EscapeString(segment.Text)
		text = strings.ReplaceAll(text, " ", "&nbsp;")
		text = strings.ReplaceAll(text, "\n", "<br />")
		output.WriteString(fmt.Sprintf(`<span%s style="%s">%s</span>`, class, styles.String(), text))
	}

	output.WriteString("</span>")
	if output.String() == "<span></span>" {
		return "<span><br /></span>"
	}
	return output.String()
}

func isLegacyCode(value rune) bool {
	return strings.ContainsRune("0123456789abcdefgklmnor", value)
}

func allHex(value []rune) bool {
	for _, character := range value {
		if !isHex(character) {
			return false
		}
	}
	return true
}

func isHex(value rune) bool {
	return (value >= '0' && value <= '9') ||
		(value >= 'a' && value <= 'f') ||
		(value >= 'A' && value <= 'F')
}
