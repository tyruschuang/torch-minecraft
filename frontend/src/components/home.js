import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import {
  Box,
  Button,
  Chip,
  Container,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { Link as RouterLink } from "react-router-dom";
import { servers } from "../app/servers";
import Info from "./info";
import Search from "./search";
import Title from "./title";

function ServerList({ items, type }) {
  return (
    <Grid2 xs={12} md={6}>
      <Stack spacing={1.5}>
        {items.map((server) => (
          <Button
            key={server.ip}
            component={RouterLink}
            to={`/search/${type}/${server.ip}`}
            variant="outlined"
            color="custom"
            fullWidth
            sx={{
              justifyContent: "stretch",
              p: 0,
              overflow: "hidden",
              bgcolor: "rgba(255, 255, 255, 0.018)",
              "&:hover .server-arrow": {
                color: "primary.main",
                transform: "translateX(3px)",
              },
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "auto minmax(0, 1fr) auto",
                alignItems: "center",
                gap: { xs: 1.25, sm: 1.75 },
                width: "100%",
                px: { xs: 1.5, sm: 2 },
                py: 1.75,
                textAlign: "left",
              }}
            >
              <Chip
                color={type === "java" ? "primary" : "secondary"}
                label={type}
                variant="outlined"
                size="small"
                sx={{
                  fontFamily: '"Fira Mono", monospace',
                  fontSize: 10,
                  height: 24,
                }}
              />
              <Box minWidth={0}>
                <Typography
                  color="text.primary"
                  fontWeight={700}
                  fontSize={15}
                  noWrap
                >
                  {server.name}
                </Typography>
                <Typography
                  color="text.secondary"
                  fontFamily='"Fira Mono", monospace'
                  fontSize={12}
                  noWrap
                >
                  {server.ip}
                </Typography>
              </Box>
              <ArrowForwardRounded
                className="server-arrow"
                sx={{
                  color: "text.secondary",
                  transition: "color 180ms ease, transform 180ms ease",
                }}
              />
            </Box>
          </Button>
        ))}
      </Stack>
    </Grid2>
  );
}

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Title />
      <Search type="Java" ip="" />

      <Box component="section" aria-labelledby="popular-servers-heading">
        <Typography
          id="popular-servers-heading"
          component="h2"
          variant="h2"
          sx={{ mb: 1, fontSize: { xs: 30, sm: 36 } }}
        >
          Try a popular server
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 680, lineHeight: 1.65 }}
        >
          Pick a known server to see the full status response, or enter any
          address above.
        </Typography>
        <Grid2 container spacing={2}>
          <ServerList items={servers.java.slice(0, 4)} type="java" />
          <ServerList items={servers.bedrock.slice(0, 4)} type="bedrock" />
        </Grid2>
      </Box>

      <Box
        component="section"
        aria-labelledby="about-heading"
        sx={{
          mt: { xs: 8, md: 10 },
          pt: { xs: 1, md: 2 },
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Info
          id="about-heading"
          title="About Torch"
          subtitle="A focused Minecraft server lookup tool with a public API."
        />
        <Stack
          spacing={2}
          sx={{
            maxWidth: "72ch",
            color: "text.secondary",
            fontSize: 16,
            lineHeight: 1.8,
          }}
        >
          <Typography color="inherit" lineHeight="inherit">
            Torch checks live Java and Bedrock server status, including player
            counts, MOTDs, versions, icons, and network latency.
          </Typography>
          <Typography color="inherit" lineHeight="inherit">
            The interface is built with React and Material UI. The Go API talks
            directly to Minecraft servers using their status protocols, then
            briefly caches responses to keep repeat lookups fast.
          </Typography>
          <Typography color="inherit" lineHeight="inherit">
            Developers can use the{" "}
            <Link component={RouterLink} to="/api" fontWeight={600}>
              public API
            </Link>
            , and contributors can explore the project on{" "}
            <Link
              href="https://github.com/tyruschuang/torch-minecraft"
              target="_blank"
              rel="noopener noreferrer"
              fontWeight={600}
            >
              GitHub
            </Link>
            .
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}
