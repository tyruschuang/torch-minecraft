import { Analytics } from "@vercel/analytics/react";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import API from "./components/api";
import FAQ from "./components/faq";
import Footer from "./components/footer";
import Header from "./components/header";
import Home from "./components/home";
import NotFound from "./components/notfound";
import SearchResult from "./components/search/searchResult";
import { theme } from "./theme";

import "./app.css";

function AppContent() {
  return (
    <Box className="app-shell" display="flex" flexDirection="column">
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 1500,
          px: 2,
          py: 1,
          borderRadius: 1,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontWeight: 700,
          textDecoration: "none",
          transform: "translateY(-180%)",
          transition: "transform 160ms ease",
          "&:focus": {
            transform: "translateY(0)",
          },
        }}
      >
        Skip to content
      </Box>
      <Header />
      <Box component="main" id="main-content" className="page-enter" flex={1}>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/api" element={<API />} />
          <Route path="/search/:serverType/:ip" element={<SearchResult />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
        <Analytics />
      </BrowserRouter>
    </ThemeProvider>
  );
}
