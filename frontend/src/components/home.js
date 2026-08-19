import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { Link as RouterLink } from "react-router-dom";
import { removeSavedServer, useSavedServers } from "../app/savedServers";
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
                label={type === "java" ? "Java" : "Bedrock"}
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

function SavedServerList({ items }) {
  return (
    <Grid2 container spacing={2}>
      {items.map((server) => (
        <Grid2 key={server.id} xs={12} md={6}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              alignItems: "stretch",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "rgba(255, 255, 255, 0.018)",
            }}
          >
            <Button
              component={RouterLink}
              to={`/search/${server.type}/${encodeURIComponent(server.ip)}`}
              color="custom"
              sx={{
                justifyContent: "flex-start",
                minWidth: 0,
                px: 2,
                py: 1.5,
                borderRadius: 0,
              }}
            >
              <Chip
                label={
                  server.type === "java"
                    ? "Java"
                    : server.type === "bedrock"
                      ? "Bedrock"
                      : "Auto"
                }
                variant="outlined"
                size="small"
                color={
                  server.type === "java"
                    ? "primary"
                    : server.type === "bedrock"
                      ? "secondary"
                      : "default"
                }
                sx={{
                  mr: 1.5,
                  fontFamily: '"Fira Mono", monospace',
                  fontSize: 10,
                  height: 24,
                }}
              />
              <Box minWidth={0} textAlign="left">
                <Typography color="text.primary" fontWeight={700} noWrap>
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
            </Button>
            <Tooltip title="Remove saved server">
              <IconButton
                aria-label={`Remove ${server.name} from saved servers`}
                onClick={() => removeSavedServer(server.id)}
                sx={{ borderRadius: 0, px: 2, color: "text.secondary" }}
              >
                <CloseRounded />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid2>
      ))}
    </Grid2>
  );
}

export default function Home() {
  const savedServers = useSavedServers();

  return (
    <Container maxWidth="lg">
      <Title />
      <Search type="Auto" ip="" />

      {savedServers.length > 0 && (
        <Box component="section" aria-labelledby="saved-servers-heading">
          <Typography
            id="saved-servers-heading"
            component="h2"
            variant="h2"
            sx={{ mb: 1, fontSize: { xs: 30, sm: 36 } }}
          >
            Saved servers
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 680, lineHeight: 1.65 }}
          >
            Stored in this browser only—no account required.
          </Typography>
          <SavedServerList items={savedServers} />
        </Box>
      )}

      <Box
        component="section"
        aria-labelledby="popular-servers-heading"
        sx={{ mt: savedServers.length > 0 ? { xs: 7, md: 8 } : 0 }}
      >
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
          Open a sample result, or enter any server address above.
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
          subtitle="Live status, faithful MOTDs, practical diagnostics, and a public API."
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
            Torch auto-detects Java and Bedrock servers, checks live status, and
            explains DNS, port, protocol, and reachability issues when a
            connection fails.
          </Typography>
          <Typography color="inherit" lineHeight="inherit">
            Results preserve the colors and formatting advertised in the
            Minecraft server list. Status responses are cached briefly to keep
            repeat lookups fast without hiding meaningful changes.
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
