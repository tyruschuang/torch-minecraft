import { Typography } from "@mui/material";

const specialWordStyle = {
  color: "#ffc247",
  fontFamily: '"Fira Mono", monospace',
};

export const questions = [
  {
    question: "What is Torch?",
    answer: (
      <Typography>
        Torch is a Minecraft server status checker allowing you to easily check
        the status of your favorite Minecraft servers.
      </Typography>
    ),
  },
  {
    question: "How do I use Torch?",
    answer: (
      <Typography>
        Enter the server address and leave the edition on Auto detect, or choose
        Java or Bedrock yourself. Torch will display the status and connection
        diagnostics. If you don't enter a port, the default port for that
        edition is used.
      </Typography>
    ),
  },
  {
    question: "What is the difference between Java and Bedrock?",
    answer: (
      <Typography>
        <span style={specialWordStyle}>Java</span> and{" "}
        <span style={specialWordStyle}>Bedrock</span> are the two main versions
        of Minecraft. <span style={specialWordStyle}>Java</span> is the original
        version of Minecraft and is the most popular version, most commonly
        played on a PC. <span style={specialWordStyle}>Bedrock</span> is the
        version of Minecraft that is used mainly on mobile devices and consoles,
        as well as the Windows 10 edition for PC.
      </Typography>
    ),
  },
  {
    question: "What is Torch built with?",
    answer: (
      <Typography>
        The Torch website uses <span style={specialWordStyle}>React</span> and
        Material UI. The backend is built with{" "}
        <span style={specialWordStyle}>Go</span>.
      </Typography>
    ),
  },
  {
    question: "How can I hide the status of my server?",
    answer: (
      <Typography>
        You can hide the status of your server by changing the{" "}
        <span style={specialWordStyle}>enable-status</span> property in your{" "}
        <span style={specialWordStyle}>server.properties</span> file to{" "}
        <span style={specialWordStyle}>false</span>. Keep in mind that this will
        also prevent Minecraft clients from seeing your server's MOTD in the
        server list.
      </Typography>
    ),
  },
  {
    question: "Is the ping to my server accurate?",
    answer: (
      <Typography>
        The ping you see in the server status response is the ping from Torch's
        server to the target server. This is not the same latency that you would
        see if you were to ping the server from your computer.
      </Typography>
    ),
  },
  {
    question: "How can I see all the players on the server?",
    answer: (
      <Typography>
        Minecraft servers do not send a full list of all online players. They
        send a list limited to 12 players, picked at random. Most public servers
        either have this feature disabled, or modify the player names to show
        custom messages.
      </Typography>
    ),
  },
  {
    question: "Where is Torch and the Torch API hosted?",
    answer: (
      <Typography>
        The site is served by Vercel's network, and the API currently runs in
        Vercel's Washington, D.C. region.
      </Typography>
    ),
  },
];
