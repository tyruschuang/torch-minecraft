import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import { Box, Button, Chip, Typography } from "@mui/material";
import { useState } from "react";
import MinecraftFormatted from "../util/format";
import { renderComponents } from "./searchResult";

export default function JavaResult(props) {
  const { data } = props;
  const [openPlayerList, setOpenPlayerList] = useState(false);
  const playerSample = data.players.sample || [];

  const components = {
    Status: (
      <Chip
        label="online"
        color="success"
        variant="outlined"
        size="small"
        sx={{
          fontWeight: "bold",
        }}
      />
    ),
    Host: (
      <Typography component="p" fontFamily="Minecraft" fontSize={13}>
        {data.host}
      </Typography>
    ),
    Port: (
      <Typography component="p" fontFamily="Minecraft" fontSize={13}>
        {data.port}
      </Typography>
    ),
    Icon: data.icon ? (
      <Box
        component="img"
        src={data.icon}
        alt={`${data.host} server icon`}
        width={64}
        height={64}
        sx={{
          display: "block",
          borderRadius: 1,
          imageRendering: "pixelated",
        }}
      />
    ) : (
      <Typography color="text.secondary">Not provided</Typography>
    ),
    MOTD: (
      <Box
        backgroundColor="search.background"
        px={2}
        py={1.5}
        borderRadius={1}
        fontSize={13}
        fontFamily="Minecraft"
        lineHeight="18px"
        minHeight={60}
        display="flex"
        alignItems="center"
        sx={{
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          color: "#ffffff",
        }}
      >
        <MinecraftFormatted value={data.description} />
      </Box>
    ),
    Version: (
      <Typography component="p" fontFamily="Minecraft" fontSize={13}>
        {data.version.name.raw}
      </Typography>
    ),
    Protocol: (
      <Typography component="p" fontFamily="Minecraft" fontSize={13}>
        {data.version.protocol}
      </Typography>
    ),
    Players: (
      <Box>
        <Box display="flex" alignItems="center">
          <Typography component="p" fontFamily="Minecraft" fontSize={13}>
            {data.players.online} / {data.players.max}
          </Typography>
          {playerSample.length > 0 && (
            <Button
              variant="outlined"
              color="w"
              endIcon={
                openPlayerList ? <ExpandLessRounded /> : <ExpandMoreRounded />
              }
              onClick={() => setOpenPlayerList(!openPlayerList)}
              sx={{
                textTransform: "none",
                marginLeft: 2,
              }}
            >
              {openPlayerList ? "Hide player list" : "Show player list"}
            </Button>
          )}
        </Box>
        {openPlayerList && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            marginTop={2}
            backgroundColor="search.background"
            borderRadius={1}
            paddingLeft={4}
          >
            {playerSample.map((player) => (
              <Typography
                component="p"
                fontFamily="Minecraft"
                fontSize={13}
                key={player.id}
                lineHeight={2}
                letterSpacing={0.5}
              >
                <MinecraftFormatted value={player.name} />
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    ),
    SRV_Record: (
      <Typography component="p" fontFamily="Minecraft" fontSize={13}>
        {data.used_srv
          ? `${data.used_srv.host}, ${data.used_srv.port}`
          : "None"}
      </Typography>
    ),
    Latency: (
      <Typography component="p" fontFamily="Minecraft" fontSize={13}>
        {`${data.latency}ms`}
      </Typography>
    ),
  };

  return <>{renderComponents(components)}</>;
}
