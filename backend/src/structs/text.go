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

const maxTextComponentDepth = 64
const maxTextSegments = 2048

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

type legacyProfile struct {
	Colors                 map[rune]string
	AllowHex               bool
	ColorResetsDecorations bool
	Bedrock                bool
}

var javaLegacyProfile = legacyProfile{
	Colors:                 standardLegacyColors(),
	AllowHex:               true,
	ColorResetsDecorations: true,
}

func Parse(object interface{}) *ParsedText {
	styledSegments := make([]styledSegment, 0)
	appendComponent(&styledSegments, object, textStyle{}, javaLegacyProfile, 0)

	raw, ok := object.(string)
	if !ok {
		raw = ""
	}
	return parsedText(raw, styledSegments)
}

func ParseBedrock(lines []string, version string) *ParsedText {
	styledSegments := make([]styledSegment, 0)
	profile := bedrockLegacyProfile(version)
	for index, line := range lines {
		if index > 0 {
			appendStyledText(&styledSegments, "\n", textStyle{})
		}
		appendLegacyText(&styledSegments, line, textStyle{}, profile)
	}
	return parsedText(strings.Join(lines, "\n"), styledSegments)
}

func parsedText(raw string, styledSegments []styledSegment) *ParsedText {
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

	if raw == "" {
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

func appendComponent(segments *[]styledSegment, component interface{}, inherited textStyle, profile legacyProfile, depth int) {
	if depth > maxTextComponentDepth || len(*segments) >= maxTextSegments {
		return
	}

	switch value := component.(type) {
	case nil:
		return
	case string:
		appendLegacyText(segments, value, inherited, profile)
	case []interface{}:
		if len(value) == 0 {
			return
		}

		appendComponent(segments, value[0], inherited, profile, depth+1)
		childStyle := componentStyle(value[0], inherited)
		for _, child := range value[1:] {
			appendComponent(segments, child, childStyle, profile, depth+1)
		}
	case map[string]interface{}:
		style := applyComponentStyle(inherited, value)
		appendComponentContent(segments, value, style, profile, depth)

		if children, ok := value["extra"].([]interface{}); ok {
			for _, child := range children {
				appendComponent(segments, child, style, profile, depth+1)
			}
		}
	}
}

func appendComponentContent(segments *[]styledSegment, component map[string]interface{}, style textStyle, profile legacyProfile, depth int) {
	componentType, _ := component["type"].(string)
	if !validComponentType(componentType, component) {
		componentType = inferredComponentType(component)
	}

	switch componentType {
	case "text":
		text, _ := component["text"].(string)
		appendLegacyText(segments, text, style, profile)
	case "translatable":
		translation, _ := component["translate"].(string)
		template := translation
		if fallback, ok := component["fallback"].(string); ok {
			template = fallback
		}

		arguments, _ := component["with"].([]interface{})
		appendTranslation(segments, template, arguments, style, profile, depth)
	case "score":
		if score, ok := component["score"].(map[string]interface{}); ok {
			value, _ := score["value"].(string)
			appendLegacyText(segments, value, style, profile)
		}
	case "selector", "keybind", "nbt":
		key := componentType
		if value, ok := component[key].(string); ok {
			appendLegacyText(segments, value, style, profile)
		}
	}
}

func validComponentType(componentType string, component map[string]interface{}) bool {
	switch componentType {
	case "text":
		_, ok := component["text"].(string)
		return ok
	case "translatable":
		_, ok := component["translate"].(string)
		return ok
	case "score":
		_, ok := component["score"].(map[string]interface{})
		return ok
	case "selector", "keybind", "nbt":
		_, ok := component[componentType].(string)
		return ok
	default:
		return false
	}
}

func inferredComponentType(component map[string]interface{}) string {
	if _, ok := component["text"].(string); ok {
		return "text"
	}
	if _, ok := component["translate"].(string); ok {
		return "translatable"
	}
	if _, ok := component["score"].(map[string]interface{}); ok {
		return "score"
	}
	for _, componentType := range []string{"selector", "keybind", "nbt"} {
		if _, ok := component[componentType].(string); ok {
			return componentType
		}
	}
	return ""
}

func appendTranslation(segments *[]styledSegment, template string, arguments []interface{}, style textStyle, profile legacyProfile, depth int) {
	nextArgument := 0
	for cursor := 0; cursor < len(template); {
		percentOffset := strings.IndexByte(template[cursor:], '%')
		if percentOffset < 0 {
			appendLegacyText(segments, template[cursor:], style, profile)
			return
		}

		percent := cursor + percentOffset
		appendLegacyText(segments, template[cursor:percent], style, profile)

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
			appendComponent(segments, arguments[argumentIndex], style, profile, depth+1)
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

func appendLegacyText(segments *[]styledSegment, value string, inherited textStyle, profile legacyProfile) {
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
		if marker != '§' {
			text.WriteRune(marker)
			index++
			continue
		}

		if profile.AllowHex {
			if color, consumed, ok := legacyHexColor(runes, index); ok {
				flush()
				style = resetDecorations(style, inherited)
				style.Color = color
				index += consumed
				continue
			}
		}

		if index+1 >= len(runes) {
			text.WriteRune(marker)
			index++
			continue
		}

		code := rune(strings.ToLower(string(runes[index+1]))[0])
		if !isLegacyCode(code, profile) {
			text.WriteRune(marker)
			index++
			continue
		}

		flush()
		style = applyLegacyCode(style, inherited, code, profile)
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
		if runes[markerIndex] != '§' || !isHex(runes[digitIndex]) {
			return "", 0, false
		}
		digits = append(digits, runes[digitIndex])
	}

	return "#" + strings.ToLower(string(digits)), 14, true
}

func applyLegacyCode(style textStyle, inherited textStyle, code rune, profile legacyProfile) textStyle {
	if color, ok := profile.Colors[code]; ok {
		if profile.ColorResetsDecorations {
			style = resetDecorations(style, inherited)
		}
		style.Color = color
		return style
	}

	switch code {
	case 'k':
		style.Obfuscated = true
	case 'l':
		style.Bold = true
	case 'm':
		if !profile.Bedrock {
			style.Strikethrough = true
		}
	case 'n':
		if !profile.Bedrock {
			style.Underlined = true
		}
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
	if len(*segments) >= maxTextSegments {
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

func standardLegacyColors() map[rune]string {
	return map[rune]string{
		'0': "#000000",
		'1': "#0000aa",
		'2': "#00aa00",
		'3': "#00aaaa",
		'4': "#aa0000",
		'5': "#aa00aa",
		'6': "#ffaa00",
		'7': "#aaaaaa",
		'8': "#555555",
		'9': "#5555ff",
		'a': "#55ff55",
		'b': "#55ffff",
		'c': "#ff5555",
		'd': "#ff55ff",
		'e': "#ffff55",
		'f': "#ffffff",
	}
}

func bedrockLegacyProfile(version string) legacyProfile {
	colors := standardLegacyColors()
	colors['g'] = "#ddd605"

	materialColors := map[rune]string{
		'h': "#e3d4d1",
		'i': "#cecaca",
		'j': "#443a3b",
		'm': "#971607",
		'n': "#b4684d",
		'p': "#deb12d",
		'q': "#119f36",
		's': "#2cbaa8",
		't': "#21497b",
		'u': "#9a5cc6",
		'v': "#eb7114",
	}
	if usesUpdatedBedrockMaterialColors(version) {
		materialColors = map[rune]string{
			'h': "#d9ccb8",
			'i': "#a9b4b7",
			'j': "#8f727d",
			'm': "#ee222c",
			'n': "#c87363",
			'p': "#ffbf1e",
			'q': "#13a045",
			's': "#5fecff",
			't': "#577bff",
			'u': "#b66cdd",
			'v': "#ff6a00",
		}
	}
	for code, color := range materialColors {
		colors[code] = color
	}

	return legacyProfile{
		Colors:  colors,
		Bedrock: true,
	}
}

func usesUpdatedBedrockMaterialColors(version string) bool {
	parts := strings.Split(version, ".")
	numbers := make([]int, 0, len(parts))
	for _, part := range parts {
		number, err := strconv.Atoi(part)
		if err != nil {
			break
		}
		numbers = append(numbers, number)
	}

	if len(numbers) >= 3 && numbers[0] == 1 {
		return numbers[1] > 26 || (numbers[1] == 26 && numbers[2] >= 50)
	}
	if len(numbers) >= 2 {
		return numbers[0] > 26 || (numbers[0] == 26 && numbers[1] >= 50)
	}
	return false
}

func isLegacyCode(value rune, profile legacyProfile) bool {
	if _, ok := profile.Colors[value]; ok {
		return true
	}
	if value == 'k' || value == 'l' || value == 'o' || value == 'r' {
		return true
	}
	return !profile.Bedrock && (value == 'm' || value == 'n')
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
