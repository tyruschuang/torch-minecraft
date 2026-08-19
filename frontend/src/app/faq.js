import { Box, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function Code({ children }) {
  return (
    <Box
      component="code"
      sx={{ color: "primary.light", fontFamily: '"Fira Mono", monospace' }}
    >
      {children}
    </Box>
  );
}

function AnswerList({ children }) {
  return (
    <Box component="ul" sx={{ mt: 1.25, mb: 0, pl: 2.5 }}>
      {children}
    </Box>
  );
}

export const questions = [
  {
    question: "What can Torch tell me about a server?",
    answer: (
      <Typography component="div">
        Torch reads the public status response that Minecraft itself uses in the
        multiplayer server list. Depending on the edition and server, that can
        include:
        <AnswerList>
          <li>Online status, edition, version, and protocol</li>
          <li>
            Player count and any player sample the server chooses to share
          </li>
          <li>MOTD formatting, server icon, advertised ports, and latency</li>
          <li>DNS, SRV, and connection diagnostics</li>
        </AnswerList>
        <Box component="p" sx={{ mb: 0 }}>
          A successful status check confirms that the status service responded.
          It does not guarantee that every player can join.
        </Box>
      </Typography>
    ),
  },
  {
    question: "What server address should I enter?",
    answer: (
      <Typography component="div">
        Enter the same address you would add in Minecraft, such as{" "}
        <Code>mc.hypixel.net</Code> or <Code>example.net:25570</Code>. If you
        omit the port, Torch checks Java on <Code>25565</Code> and Bedrock on{" "}
        <Code>19132</Code>. Bracketed IPv6 addresses with a port are also
        supported, for example <Code>[2001:db8::1]:25565</Code>.
      </Typography>
    ),
  },
  {
    question: "How does Auto-detect choose an edition?",
    answer: (
      <Typography component="div">
        Auto-detect probes Java and Bedrock at the same time. If only one
        responds, Torch selects it. If both respond, Torch displays Java and
        reports both successful probes in Connection diagnostics.
        <Box component="p" sx={{ mb: 0 }}>
          When Java and Bedrock use different custom ports, select the edition
          manually and enter its port.
        </Box>
      </Typography>
    ),
  },
  {
    question: "What is the difference between Java and Bedrock?",
    answer: (
      <Typography component="div">
        Java Edition is the original PC version for Windows, macOS, and Linux.
        Bedrock Edition powers Minecraft on consoles, mobile devices, and the
        current Minecraft for Windows release. Some networks support both
        editions through separate addresses or ports.
      </Typography>
    ),
  },
  {
    question: "Why does Torch say my server is offline?",
    answer: (
      <Typography component="div">
        “Offline” means Torch did not receive a valid status response before the
        timeout. It does not always mean the game server is shut down.
        <AnswerList>
          <li>Confirm the hostname, edition, and port.</li>
          <li>Check whether the server is still starting or restarting.</li>
          <li>
            Open Connection diagnostics and review DNS and port reachability.
          </li>
          <li>
            Confirm that a firewall, proxy, or host is not blocking status
            requests.
          </li>
        </AnswerList>
      </Typography>
    ),
  },
  {
    question: "How do I read Connection diagnostics?",
    answer: (
      <Typography component="div">
        DNS addresses show where the hostname resolves. An SRV target shows the
        host and port Minecraft redirects Java players to. Each edition card
        then reports whether that TCP or UDP status service responded, along
        with its version, protocol, and latency.
        <Box component="p" sx={{ mb: 0 }}>
          It is normal for a Java-only server to show Bedrock as unavailable,
          and vice versa.
        </Box>
      </Typography>
    ),
  },
  {
    question: "Why is Torch's latency different from my in-game ping?",
    answer: (
      <Typography component="div">
        Torch measures the round trip between the Torch API and the Minecraft
        server. Your in-game ping travels from your device and may take a very
        different network route. If a server returns status data but does not
        answer the follow-up ping packet, Torch displays “Not reported.”
      </Typography>
    ),
  },
  {
    question: "Why can't I see every online player?",
    answer: (
      <Typography component="div">
        The server controls the player sample in its status response. It may
        send a partial list, replace names with a custom message, or omit the
        list entirely for privacy. Torch cannot retrieve players the server does
        not advertise.
      </Typography>
    ),
  },
  {
    question: "How current is the status data?",
    answer: (
      <Typography component="div">
        Java and Bedrock status responses are cached for 30 seconds. SRV records
        and server icons are cached for 30 minutes. API responses include{" "}
        <Code>obtained_at</Code> and <Code>expires_at</Code> timestamps so you
        can see exactly when cached data was collected and when it refreshes.
      </Typography>
    ),
  },
  {
    question: "How do saved servers work?",
    answer: (
      <Typography component="div">
        Select “Save server” on any result to add a shortcut to the homepage.
        Torch stores up to 12 saved servers in this browser only. There is no
        account or cloud sync, and clearing this site's browser data removes the
        list.
      </Typography>
    ),
  },
  {
    question: "Can I use Torch data in my own app?",
    answer: (
      <Typography component="div">
        Yes. The public, read-only API returns JSON for automatic detection,
        explicit Java or Bedrock status, connection diagnostics, SRV records,
        and server icons. See the{" "}
        <Link component={RouterLink} to="/api" fontWeight={700}>
          API documentation
        </Link>{" "}
        for routes and example responses.
      </Typography>
    ),
  },
  {
    question: "How can I hide my Java server's status?",
    answer: (
      <Typography component="div">
        Set <Code>enable-status=false</Code> in the Java server's{" "}
        <Code>server.properties</Code> file, then restart the server. This also
        removes its MOTD and player count from Minecraft's multiplayer server
        list. Bedrock and proxy software use different settings; check that
        software's documentation.
      </Typography>
    ),
  },
];
