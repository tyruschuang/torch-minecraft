import Check from "@mui/icons-material/Check";
import ContentCopy from "@mui/icons-material/FileCopy";
import { IconButton, Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function Copy(props) {
  const [iconState, setIconState] = useState("copy");
  const [toolTipText, setToolTipText] = useState("Copy to clipboard");
  const timeoutRef = useRef(null);

  useEffect(
    () => () => {
      clearTimeout(timeoutRef.current);
    },
    [],
  );

  const copyToClipboard = async () => {
    clearTimeout(timeoutRef.current);

    try {
      await navigator.clipboard.writeText(props.text);
      setIconState("check");
      setToolTipText("Copied");
    } catch {
      setToolTipText("Copy failed");
    } finally {
      timeoutRef.current = setTimeout(() => {
        setIconState("copy");
        setToolTipText("Copy to clipboard");
      }, 3000);
    }
  };

  return (
    <Tooltip title={toolTipText}>
      <IconButton
        aria-label={toolTipText}
        onClick={copyToClipboard}
        sx={props.sx}
      >
        {iconState === "copy" ? (
          <ContentCopy
            color="custom"
            sx={{
              "&:hover": {
                color: "white",
              },
            }}
          />
        ) : (
          <Check color="success" />
        )}
      </IconButton>
    </Tooltip>
  );
}
