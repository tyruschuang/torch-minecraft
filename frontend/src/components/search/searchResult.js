import BookmarkAddRounded from "@mui/icons-material/BookmarkAddRounded";
import BookmarkRemoveRounded from "@mui/icons-material/BookmarkRemoveRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { stackoverflowDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { apiBaseUrl } from "../../app/api";
import { toggleSavedServer, useSavedServers } from "../../app/savedServers";
import status from "../../app/status";
import Search from "../search";
import Title from "../title";
import Copy from "../util/copy";
import BedrockResult from "./bedrockResult";
import Diagnostics from "./diagnostics";
import JavaResult from "./javaResult";
import Offline from "./offline";

export function renderComponents(components) {
  return (
    <Box component="dl" sx={{ m: 0 }}>
      {Object.entries(components).map(([key, value], index, entries) => (
        <Box
          key={key}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "150px minmax(0, 1fr)" },
            gap: { xs: 0.75, sm: 2 },
            alignItems: "start",
            py: 2.25,
            borderBottom: index === entries.length - 1 ? 0 : 1,
            borderColor: "divider",
          }}
        >
          <Typography
            component="dt"
            sx={{
              color: "text.secondary",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {key.replace(/_/g, " ")}
          </Typography>
          <Box component="dd" sx={{ m: 0, minWidth: 0 }}>
            {value}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default function SearchResult() {
  const { serverType, ip } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detectedEdition, setDetectedEdition] = useState(serverType);
  const [diagnostics, setDiagnostics] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const savedServers = useSavedServers();
  const apiUrl = `${apiBaseUrl}/status/${serverType}/${encodeURIComponent(ip)}`;
  const savedType = serverType.toLowerCase();
  const savedId = `${savedType}:${ip.trim().toLowerCase()}`;
  const isSaved = savedServers.some((server) => server.id === savedId);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setDetectedEdition(serverType);
    setDiagnostics(null);
    setError(false);
    setLoading(true);

    async function loadStatus() {
      try {
        const result = await status(ip, serverType);
        if (!cancelled) {
          setData(result.data);
          setDetectedEdition(result.edition);
          setDiagnostics(result.diagnostics);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, [ip, refreshKey, serverType]);

  const apiResponse =
    serverType === "auto"
      ? { edition: detectedEdition, status: data, diagnostics }
      : data;

  return (
    <Container maxWidth="lg">
      <Title compact />
      <Search
        type={serverType}
        ip={ip}
        onRefresh={() => setRefreshKey((key) => key + 1)}
      />

      {loading && (
        <Paper
          variant="outlined"
          role="status"
          aria-live="polite"
          sx={{
            display: "flex",
            minHeight: 190,
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            borderColor: "divider",
            bgcolor: "rgba(255, 255, 255, 0.018)",
          }}
        >
          <CircularProgress size={26} />
          <Typography color="text.secondary">Checking {ip}&hellip;</Typography>
        </Paper>
      )}

      {!loading && error && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{
            py: 1.5,
            borderRadius: 2,
            "& .MuiAlert-message": {
              lineHeight: 1.6,
            },
          }}
        >
          Torch could not reach the status API. Wait a moment, then try your
          search again.
        </Alert>
      )}

      {!loading && !error && data && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              {serverType === "auto" && detectedEdition !== "auto" && (
                <Chip
                  label={`${detectedEdition} detected`}
                  color={detectedEdition === "java" ? "primary" : "secondary"}
                  variant="outlined"
                  sx={{ textTransform: "capitalize" }}
                />
              )}
            </Box>
            <Button
              variant="outlined"
              color="custom"
              startIcon={
                isSaved ? <BookmarkRemoveRounded /> : <BookmarkAddRounded />
              }
              onClick={() =>
                toggleSavedServer({
                  ip,
                  name: data.host || ip,
                  type: savedType,
                })
              }
            >
              {isSaved ? "Remove saved" : "Save server"}
            </Button>
          </Box>
          <Paper
            variant="outlined"
            sx={{
              px: { xs: 2, sm: 3 },
              borderColor: "divider",
              bgcolor: "rgba(255, 255, 255, 0.018)",
              boxShadow: "0 18px 54px rgba(0, 0, 0, 0.2)",
            }}
          >
            {data.offline ? (
              <Offline data={data} />
            ) : detectedEdition === "bedrock" ? (
              <BedrockResult data={data} />
            ) : (
              <JavaResult data={data} />
            )}
          </Paper>

          <Diagnostics initialDiagnostics={diagnostics} ip={ip} />

          <Accordion
            disableGutters
            elevation={0}
            sx={{
              mt: 3,
              border: 1,
              borderColor: "divider",
              borderRadius: "12px !important",
              bgcolor: "rgba(255, 255, 255, 0.018)",
              overflow: "hidden",
              "&::before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRounded />}
              sx={{
                minHeight: 64,
                px: { xs: 2, sm: 2.5 },
                "& .MuiAccordionSummary-content": {
                  alignItems: "center",
                  gap: 1.25,
                },
              }}
            >
              <Chip
                size="small"
                label="GET"
                color="success"
                variant="outlined"
                sx={{
                  fontFamily: '"Fira Mono", monospace',
                  fontSize: 10,
                }}
              />
              <Typography fontWeight={700}>
                Use this response in code
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5 }}>
              <Typography
                component="code"
                color="text.secondary"
                fontFamily='"Fira Mono", monospace'
                fontSize={13}
                sx={{ display: "block", mb: 2, overflowWrap: "anywhere" }}
              >
                {apiUrl}
              </Typography>
              <Box position="relative">
                <Copy
                  text={JSON.stringify(apiResponse, null, 2)}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    zIndex: 1,
                    bgcolor: "rgba(9, 9, 8, 0.78)",
                  }}
                />
                <SyntaxHighlighter
                  lineProps={{
                    style: {
                      wordBreak: "break-all",
                      whiteSpace: "pre-wrap",
                    },
                  }}
                  language="json"
                  style={stackoverflowDark}
                  customStyle={{
                    margin: 0,
                    maxHeight: 520,
                    borderRadius: 10,
                    background: "#0b0b0a",
                    fontSize: 12,
                    lineHeight: 1.65,
                  }}
                >
                  {JSON.stringify(apiResponse, null, 2)}
                </SyntaxHighlighter>
              </Box>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Container>
  );
}
