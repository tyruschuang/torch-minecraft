import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { stackoverflowDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { apiBaseUrl, endpoints, sections } from "../app/api";
import Info from "./info";
import Title from "./title";
import Copy from "./util/copy";

function APISection({ description, title }) {
  return (
    <Box component="section" sx={{ mt: 5 }}>
      <Typography
        component="h3"
        variant="h3"
        sx={{ mb: 1.5, color: "text.primary", fontSize: 24 }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          maxWidth: "72ch",
          color: "text.secondary",
          "& .MuiTypography-root": {
            color: "inherit",
            lineHeight: 1.75,
          },
        }}
      >
        {description}
      </Box>
    </Box>
  );
}

function endpointId(title) {
  return `endpoint-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function APIQuickStart() {
  return (
    <Box
      component="aside"
      aria-label="API quick start"
      sx={{ position: { md: "sticky" }, top: { md: 96 }, alignSelf: "start" }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderColor: "divider",
          bgcolor: "rgba(255, 255, 255, 0.018)",
          boxShadow: "0 18px 54px rgba(0, 0, 0, 0.18)",
        }}
      >
        <Typography component="h3" variant="h3" sx={{ fontSize: 22 }}>
          Quick start
        </Typography>
        <Typography color="text.secondary" fontSize={13} sx={{ mt: 2 }}>
          Base URL
        </Typography>
        <Box
          sx={{
            position: "relative",
            mt: 0.75,
            p: 1.5,
            pr: 5,
            borderRadius: 2,
            bgcolor: "#0b0b0a",
            border: 1,
            borderColor: "divider",
          }}
        >
          <Typography
            component="code"
            fontFamily='"Fira Mono", monospace'
            fontSize={12}
            sx={{ overflowWrap: "anywhere" }}
          >
            {apiBaseUrl}
          </Typography>
          <Copy
            text={apiBaseUrl}
            sx={{ position: "absolute", top: 5, right: 5 }}
          />
        </Box>

        <Typography color="text.secondary" fontSize={13} sx={{ mt: 2 }}>
          Recommended first request
        </Typography>
        <Box
          sx={{
            position: "relative",
            mt: 0.75,
            p: 1.5,
            pr: 5,
            borderRadius: 2,
            bgcolor: "#0b0b0a",
            border: 1,
            borderColor: "divider",
          }}
        >
          <Typography
            component="code"
            fontFamily='"Fira Mono", monospace'
            fontSize={12}
            sx={{ overflowWrap: "anywhere" }}
          >
            GET /status/auto/&lt;address&gt;
          </Typography>
          <Copy
            text={`${apiBaseUrl}/status/auto/<address>`}
            sx={{ position: "absolute", top: 5, right: 5 }}
          />
        </Box>

        <Divider sx={{ my: 2.5 }} />
        <Typography component="h3" fontWeight={700}>
          Endpoints
        </Typography>
        <Stack component="nav" aria-label="API endpoints" spacing={0.5} mt={1}>
          {endpoints.map((endpoint) => (
            <Box
              key={endpoint.title}
              component="a"
              href={`#${endpointId(endpoint.title)}`}
              sx={{
                py: 0.75,
                color: "text.secondary",
                fontSize: 14,
                textDecoration: "none",
                "&:hover": { color: "primary.main" },
                "&:focus-visible": {
                  color: "primary.main",
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: 2,
                },
              }}
            >
              {endpoint.title}
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}

function APIEndpoint({ description, id, response, route, title }) {
  const endpointUrl = `${apiBaseUrl}/${route}`;

  return (
    <Accordion
      id={id}
      disableGutters
      elevation={0}
      sx={{
        scrollMarginTop: 96,
        mb: 1.5,
        border: 1,
        borderColor: "divider",
        borderRadius: "12px !important",
        bgcolor: "rgba(255, 255, 255, 0.018)",
        overflow: "hidden",
        "&::before": {
          display: "none",
        },
        "&.Mui-expanded": {
          borderColor: "rgba(99, 216, 255, 0.32)",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRounded />}
        sx={{
          minHeight: 68,
          px: { xs: 2, sm: 2.5 },
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            gap: 1.5,
            my: 1.5,
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
            fontWeight: 500,
            fontSize: 10,
          }}
        />
        <Typography
          component="h3"
          sx={{ color: "text.primary", fontSize: 16, fontWeight: 700 }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5 }}>
        <Box
          sx={{
            color: "text.secondary",
            "& .MuiTypography-root": {
              color: "inherit",
              lineHeight: 1.7,
            },
          }}
        >
          {description}
        </Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={1.25}
          sx={{
            mt: 2.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "rgba(99, 216, 255, 0.055)",
            border: 1,
            borderColor: "rgba(99, 216, 255, 0.15)",
          }}
        >
          <Chip
            size="small"
            label="GET"
            color="success"
            sx={{
              fontWeight: 700,
              fontSize: 11,
            }}
          />
          <Typography
            component="code"
            color="text.secondary"
            fontFamily='"Fira Mono", monospace'
            fontSize={13}
            sx={{ overflowWrap: "anywhere" }}
          >
            {endpointUrl}
          </Typography>
        </Stack>
        <Typography
          component="h4"
          sx={{ mt: 3, mb: 1.5, color: "text.primary", fontWeight: 700 }}
        >
          Example response
        </Typography>
        <Box position="relative">
          <Copy
            text={JSON.stringify(response, null, 2)}
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
            {JSON.stringify(response, null, 2)}
          </SyntaxHighlighter>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export default function API() {
  return (
    <Container maxWidth="lg">
      <Title compact />
      <Info
        id="api-heading"
        title="API"
        subtitle="Use the same live Minecraft status data in your own project."
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "minmax(0, 1fr) 320px",
          },
          gap: { xs: 5, md: 6 },
          alignItems: "start",
        }}
      >
        <Box>
          {sections.map((section) => (
            <APISection
              key={section.title}
              title={section.title}
              description={section.description}
            />
          ))}
        </Box>
        <APIQuickStart />
      </Box>
      <Info
        id="endpoints-heading"
        title="Endpoints"
        subtitle="Expand an endpoint for its route, behavior, and example response."
      />
      {endpoints.map((endpoint) => (
        <APIEndpoint
          key={endpoint.title}
          id={endpointId(endpoint.title)}
          title={endpoint.title}
          route={endpoint.route}
          description={endpoint.description}
          response={endpoint.response}
        />
      ))}
    </Container>
  );
}
