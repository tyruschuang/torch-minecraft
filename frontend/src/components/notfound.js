import ExploreOffRounded from "@mui/icons-material/ExploreOffRounded";
import { Box, Button, Container, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Title from "./title";

export default function NotFound() {
  return (
    <Container maxWidth="lg">
      <Title compact />
      <Box
        sx={{
          display: "flex",
          minHeight: 300,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          py: { xs: 8, md: 12 },
          textAlign: "center",
        }}
      >
        <ExploreOffRounded
          sx={{ mb: 2, color: "primary.main", fontSize: 44 }}
        />
        <Typography
          component="h2"
          variant="h2"
          sx={{ fontSize: { xs: 32, sm: 40 }, textWrap: "balance" }}
        >
          Page not found.
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ mt: 1.5, maxWidth: 480, lineHeight: 1.7 }}
        >
          That URL doesn't point to a Torch page. Return home to check a server.
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          sx={{ mt: 3, px: 3 }}
          variant="contained"
          size="large"
        >
          Go to server search
        </Button>
      </Box>
    </Container>
  );
}
