import { useEffect, useMemo, useState } from "react";

const obfuscatedCharacters =
  "abcdeghmnopqrsuwxyABCDEFGHJKLMNOPQRSTUVWXYZ0123456789#$%&";
const safeColor = /^#[0-9a-f]{6}$/i;
const safeShadowColor = /^#[0-9a-f]{8}$/i;

function getMinecraftShadow(color) {
  if (!safeColor.test(color)) {
    return "#3f3f3f";
  }

  const red = Math.floor(Number.parseInt(color.slice(1, 3), 16) / 4);
  const green = Math.floor(Number.parseInt(color.slice(3, 5), 16) / 4);
  const blue = Math.floor(Number.parseInt(color.slice(5, 7), 16) / 4);
  return `rgb(${red}, ${green}, ${blue})`;
}

function getSegmentStyle(styles) {
  const style = { color: "#ffffff" };
  const textDecoration = [];
  let shadowColor;

  for (const value of styles) {
    if (value.startsWith("color=")) {
      const color = value.slice("color=".length);
      if (safeColor.test(color)) {
        style.color = color;
      }
    } else if (value === "bold") {
      style.fontWeight = 700;
    } else if (value === "italic") {
      style.fontStyle = "italic";
    } else if (value === "underline") {
      textDecoration.push("underline");
    } else if (value === "strikethrough") {
      textDecoration.push("line-through");
    } else if (value.startsWith("font=")) {
      const font = value.slice("font=".length);
      if (font === "minecraft:uniform") {
        style.fontFamily = '"Fira Mono", monospace';
      }
    } else if (value.startsWith("shadow=")) {
      const color = value.slice("shadow=".length);
      if (safeShadowColor.test(color)) {
        shadowColor = color;
      }
    }
  }

  if (textDecoration.length) {
    style.textDecoration = textDecoration.join(" ");
  }
  style.textShadow = `1px 1px 0 ${shadowColor || getMinecraftShadow(style.color)}`;

  return style;
}

function obfuscate(text, frame) {
  return Array.from(text, (character, index) =>
    /\s/.test(character)
      ? character
      : obfuscatedCharacters[
          (frame * 17 + index * 31 + character.codePointAt(0)) %
            obfuscatedCharacters.length
        ],
  ).join("");
}

function preserveMinecraftLineBreaks(segments) {
  let lineHasContent = false;

  return segments.map((segment) => {
    let text = segment.text;
    if (lineHasContent) {
      text = text.replace(/^ {8,}(?=\S)/, "\n");
    }

    for (const character of text) {
      if (character === "\n") {
        lineHasContent = false;
      } else if (!/\s/.test(character)) {
        lineHasContent = true;
      }
    }

    return { ...segment, text };
  });
}

export default function MinecraftFormatted({ value }) {
  const [frame, setFrame] = useState(0);
  const segments = useMemo(() => {
    if (Array.isArray(value?.segments) && value.segments.length) {
      return preserveMinecraftLineBreaks(
        value.segments.map((segment, index) => ({
          key: `segment-${index}`,
          ...segment,
        })),
      );
    }

    try {
      const parsed = JSON.parse(value?.json || "{}");
      const parsedSegments = Object.keys(parsed)
        .sort((left, right) => Number(left) - Number(right))
        .map((key) => ({ key, ...parsed[key] }))
        .filter((segment) => typeof segment.text === "string");
      return preserveMinecraftLineBreaks(
        parsedSegments.length
          ? parsedSegments
          : [{ key: "fallback", text: value?.clean || "", styles: [] }],
      );
    } catch {
      return [{ key: "fallback", text: value?.clean || "", styles: [] }];
    }
  }, [value?.clean, value?.json, value?.segments]);
  const hasObfuscatedText = segments.some((segment) =>
    segment.styles?.includes("obfuscated"),
  );

  useEffect(() => {
    if (
      !hasObfuscatedText ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setFrame((current) => current + 1);
    }, 75);

    return () => window.clearInterval(interval);
  }, [hasObfuscatedText]);

  return (
    <span
      style={{
        display: "block",
        width: "min(100%, 420px)",
        whiteSpace: "pre",
      }}
    >
      {segments.map((segment) => {
        const styles = Array.isArray(segment.styles) ? segment.styles : [];
        const text = styles.includes("obfuscated")
          ? obfuscate(segment.text, frame)
          : segment.text;

        return (
          <span key={segment.key} style={getSegmentStyle(styles)}>
            {text}
          </span>
        );
      })}
    </span>
  );
}
