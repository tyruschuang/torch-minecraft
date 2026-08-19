import SearchRounded from "@mui/icons-material/SearchRounded";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Search({
  type: initialType,
  ip: initialIp,
  onRefresh,
}) {
  const navigate = useNavigate();
  const [type, setType] = useState(initialType.toLowerCase());
  const [ip, setIp] = useState(initialIp);

  useEffect(() => {
    setType(initialType.toLowerCase());
    setIp(initialIp);
  }, [initialIp, initialType]);

  const trimmedIp = ip.trim();
  const isCurrentServer =
    trimmedIp === initialIp && type === initialType.toLowerCase();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!trimmedIp) return;

    if (isCurrentServer) {
      onRefresh?.();
      return;
    }

    navigate(`/search/${type}/${encodeURIComponent(trimmedIp)}`);
  };

  return (
    <Box
      component="form"
      aria-label="Minecraft server lookup"
      onSubmit={handleSubmit}
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          md: "180px minmax(0, 1fr) auto",
        },
        gap: 1.5,
        my: { xs: 4, sm: 5 },
        p: { xs: 2, sm: 2.5 },
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "rgba(18, 18, 16, 0.82)",
        boxShadow: "0 18px 54px rgba(0, 0, 0, 0.24)",
      }}
    >
      <FormControl fullWidth>
        <InputLabel id="server-edition-label">Edition</InputLabel>
        <Select
          labelId="server-edition-label"
          label="Edition"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <MenuItem value="auto">Auto-detect</MenuItem>
          <MenuItem value="java">Java</MenuItem>
          <MenuItem value="bedrock">Bedrock</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Server address"
        placeholder="mc.hypixel.net"
        value={ip}
        onChange={(event) => setIp(event.target.value)}
        fullWidth
        autoComplete="off"
        inputProps={{
          autoCapitalize: "none",
          spellCheck: false,
        }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        endIcon={<SearchRounded />}
        disabled={!trimmedIp}
        sx={{
          minHeight: 56,
          px: { xs: 3, md: 3.5 },
          whiteSpace: "nowrap",
        }}
      >
        Check status
      </Button>
    </Box>
  );
}
