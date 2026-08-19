import { Box, Typography } from "@mui/material";

export default function Info({ id, title, subtitle }) {
  return (
    <Box sx={{ mt: { xs: 7, md: 9 }, mb: 3 }}>
      <Typography
        id={id}
        component="h2"
        variant="h2"
        sx={{
          m: 0,
          color: "text.primary",
          fontSize: { xs: 34, sm: 42 },
          lineHeight: 1.05,
        }}
      >
        {title}
      </Typography>
      <Typography
        component="p"
        sx={{
          maxWidth: 700,
          mt: 1.25,
          mb: 0,
          color: "text.secondary",
          fontSize: { xs: 16, sm: 18 },
          lineHeight: 1.6,
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}
