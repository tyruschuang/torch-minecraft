import { Box } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

const obfuscatedCharacters =
  "abcdeghmnopqrsuwxyABCDEFGHJKLMNOPQRSTUVWXYZ0123456789#$%&";
const safeColor = /^#[0-9a-f]{6}$/i;

function getSegmentStyle(styles) {
  const style = {};
  const textDecoration = [];

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
    }
  }

  if (textDecoration.length) {
    style.textDecoration = textDecoration.join(" ");
  }

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

export default function MinecraftFormatted({ value }) {
  const [frame, setFrame] = useState(0);
  const segments = useMemo(() => {
    try {
      const parsed = JSON.parse(value?.json || "{}");
      const parsedSegments = Object.keys(parsed)
        .sort((left, right) => Number(left) - Number(right))
        .map((key) => ({ key, ...parsed[key] }))
        .filter((segment) => typeof segment.text === "string");
      return parsedSegments.length
        ? parsedSegments
        : [{ key: "fallback", text: value?.clean || "", styles: [] }];
    } catch {
      return [{ key: "fallback", text: value?.clean || "", styles: [] }];
    }
  }, [value?.clean, value?.json]);
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
    <Box
      component="span"
      sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
    >
      {segments.map((segment) => {
        const styles = Array.isArray(segment.styles) ? segment.styles : [];
        const text = styles.includes("obfuscated")
          ? obfuscate(segment.text, frame)
          : segment.text;

        return (
          <Box
            component="span"
            key={segment.key}
            style={getSegmentStyle(styles)}
          >
            {text}
          </Box>
        );
      })}
    </Box>
  );
}
