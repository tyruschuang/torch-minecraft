import { Box, Typography } from "@mui/material";
import React from "react";

export default function Title({ compact = false }) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: compact ? { xs: 4.5, sm: 6 } : { xs: 7, sm: 9, md: 11 },
        pb: compact ? { xs: 4, sm: 4.5 } : { xs: 5, sm: 6 },
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box
        component="img"
        className="torch-hero__glow"
        src="/logo.png"
        alt=""
        aria-hidden="true"
        sx={{
          position: "absolute",
          right: compact ? { xs: -24, sm: 44 } : { xs: -62, sm: 24, md: 72 },
          top: compact ? { xs: 16, sm: 10 } : { xs: 24, sm: 18 },
          width: compact ? { xs: 104, sm: 130 } : { xs: 150, sm: 190, md: 220 },
          height: "auto",
          pointerEvents: "none",
        }}
      />
      <Typography
        component="h1"
        variant="h1"
        sx={{
          position: "relative",
          maxWidth: "fit-content",
          m: 0,
          color: "primary.main",
          fontSize: compact
            ? "clamp(3.5rem, 9vw, 4.5rem)"
            : "clamp(4rem, 11vw, 6rem)",
          lineHeight: 0.9,
          textShadow: "0 14px 32px rgba(255, 174, 32, 0.12)",
          "&::after": {
            content: '""',
            position: "absolute",
            left: 2,
            bottom: -9,
            width: "0.34em",
            height: 5,
            borderRadius: 99,
            bgcolor: "primary.main",
          },
        }}
      >
        torch
      </Typography>
      <Typography
        component="p"
        sx={{
          position: "relative",
          maxWidth: 650,
          mt: compact ? 3 : 3.5,
          mb: 0,
          color: "text.secondary",
          fontSize: compact ? { xs: 16, sm: 18 } : { xs: 17, sm: 20 },
          lineHeight: 1.6,
          textWrap: "balance",
        }}
      >
        Light up the{" "}
        <Box component="span" color="primary.light" fontWeight={600}>
          dark
        </Box>
        . Check any Java or Bedrock Minecraft server in seconds.
      </Typography>
    </Box>
  );
}
