import GitHubIcon from "@mui/icons-material/GitHub";
import { Box, Button, Container, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 9, md: 12 },
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "rgba(255, 255, 255, 0.012)",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          py: 4,
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "text.primary",
              fontFamily: '"Fira Mono", monospace',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            torch
          </Typography>
          <Typography
            component="p"
            sx={{
              mt: 0.75,
              mb: 0,
              color: "text.secondary",
              fontSize: 13,
            }}
          >
            © {new Date().getFullYear()} Tyrus Chuang
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="custom"
          startIcon={<GitHubIcon />}
          href="https://github.com/tyruschuang/torch-minecraft"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            px: 2,
            color: "text.secondary",
            "&:hover": {
              color: "text.primary",
            },
          }}
        >
          View Source
        </Button>
      </Container>
    </Box>
  );
}
