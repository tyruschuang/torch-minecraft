import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import TroubleshootRounded from "@mui/icons-material/TroubleshootRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getDiagnostics } from "../../app/status";

function Probe({ probe }) {
  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "rgba(255, 255, 255, 0.018)",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography
          component="h4"
          sx={{ textTransform: "capitalize", fontWeight: 700 }}
        >
          {probe.edition}
        </Typography>
        <Chip
          size="small"
          label={probe.reachable ? "Reachable" : "Unavailable"}
          color={probe.reachable ? "success" : "error"}
          variant="outlined"
        />
      </Box>
      <Box
        component="dl"
        sx={{
          display: "grid",
          gridTemplateColumns: "auto minmax(0, 1fr)",
          gap: 1,
          mt: 2,
          mb: 0,
          "& dt": { color: "text.secondary", fontSize: 13 },
          "& dd": {
            m: 0,
            minWidth: 0,
            overflowWrap: "anywhere",
            fontFamily: '"Fira Mono", monospace',
            fontSize: 13,
          },
        }}
      >
        <dt>Target</dt>
        <dd>
          {probe.host}:{probe.port}
        </dd>
        {probe.resolved_host && (
          <>
            <dt>SRV target</dt>
            <dd>
              {probe.resolved_host}:{probe.resolved_port}
            </dd>
          </>
        )}
        {probe.version && (
          <>
            <dt>Version</dt>
            <dd>
              {probe.version} · protocol {probe.protocol}
            </dd>
          </>
        )}
        {probe.latency != null && (
          <>
            <dt>Latency</dt>
            <dd>{probe.latency}ms</dd>
          </>
        )}
      </Box>
      {!probe.reachable && (
        <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.6 }}>
          {probe.error_message}
        </Typography>
      )}
    </Box>
  );
}

export default function Diagnostics({ initialDiagnostics, ip }) {
  const [diagnostics, setDiagnostics] = useState(initialDiagnostics);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDiagnostics(initialDiagnostics);
    setError(false);
  }, [initialDiagnostics, ip]);

  const loadDiagnostics = async () => {
    if (diagnostics || loading) return;

    setLoading(true);
    setError(false);
    try {
      setDiagnostics(await getDiagnostics(ip));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Accordion
      disableGutters
      elevation={0}
      onChange={(_, expanded) => {
        if (expanded) loadDiagnostics();
      }}
      sx={{
        mt: 3,
        border: 1,
        borderColor: "divider",
        borderRadius: "12px !important",
        bgcolor: "rgba(255, 255, 255, 0.018)",
        overflow: "hidden",
        "&::before": { display: "none" },
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
        <TroubleshootRounded color="primary" />
        <Box>
          <Typography fontWeight={700}>Connection diagnostics</Typography>
          <Typography color="text.secondary" fontSize={13}>
            DNS, ports, edition reachability, and protocol details
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5 }}>
        {loading && (
          <Box display="flex" alignItems="center" gap={1.5} py={2}>
            <CircularProgress size={22} />
            <Typography color="text.secondary">Running probes…</Typography>
          </Box>
        )}
        {error && (
          <Alert severity="error" variant="outlined">
            Diagnostics could not run. Try expanding this section again.
          </Alert>
        )}
        {diagnostics && (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography color="text.secondary" fontSize={13}>
                DNS addresses
              </Typography>
              <Typography
                fontFamily='"Fira Mono", monospace'
                fontSize={13}
                sx={{ mt: 0.5, overflowWrap: "anywhere" }}
              >
                {diagnostics.dns_addresses?.length
                  ? diagnostics.dns_addresses.join(", ")
                  : diagnostics.dns_error || "No addresses returned"}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <Probe probe={diagnostics.java} />
              <Probe probe={diagnostics.bedrock} />
            </Box>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
