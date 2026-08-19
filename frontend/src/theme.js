import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    contrastThreshold: 4.5,
    mode: "dark",
    background: {
      default: "#090908",
      paper: "#121210",
    },
    text: {
      primary: "#f5f3ea",
      secondary: "#b7b3a8",
    },
    divider: "rgba(255, 255, 255, 0.11)",
    primary: {
      main: "#ffc247",
      light: "#ffda85",
      dark: "#d89514",
      contrastText: "#1d1400",
    },
    secondary: {
      main: "#63d8ff",
      light: "#a3e9ff",
      dark: "#168eb6",
      contrastText: "#00151d",
    },
    success: {
      main: "#6fdf8c",
    },
    error: {
      main: "#ff7b72",
    },
    custom: {
      main: "#b7b3a8",
      text: "#f5f3ea",
    },
    search: {
      main: "rgba(255, 255, 255, 0.16)",
      background: "#171714",
    },
    w: {
      main: "#f5f3ea",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Spline Sans", sans-serif',
    h1: {
      fontFamily: '"Kanit", sans-serif',
      fontWeight: 600,
      letterSpacing: "-0.04em",
    },
    h2: {
      fontFamily: '"Kanit", sans-serif',
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontFamily: '"Kanit", sans-serif',
      fontWeight: 500,
    },
    button: {
      fontWeight: 700,
      letterSpacing: "0.01em",
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#090908",
          backgroundImage:
            "radial-gradient(circle at 15% -10%, rgba(255, 194, 71, 0.10), transparent 34rem), radial-gradient(circle at 92% 22%, rgba(99, 216, 255, 0.055), transparent 30rem)",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 10,
          transition:
            "border-color 180ms ease, background-color 180ms ease, color 180ms ease, transform 180ms ease",
          "&:focus-visible": {
            outline: "3px solid rgba(255, 194, 71, 0.42)",
            outlineOffset: 2,
          },
        },
        outlined: {
          borderColor: "rgba(255, 255, 255, 0.18)",
          "&:hover": {
            borderColor: "rgba(255, 194, 71, 0.62)",
            backgroundColor: "rgba(255, 194, 71, 0.07)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:focus-visible": {
            outline: "3px solid rgba(255, 194, 71, 0.42)",
            outlineOffset: 2,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: 52,
          backgroundColor: "rgba(255, 255, 255, 0.025)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.18)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.34)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffc247",
            borderWidth: 2,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: '"Spline Sans", sans-serif',
          fontSize: 12,
        },
      },
    },
  },
});
