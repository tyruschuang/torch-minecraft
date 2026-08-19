import GitHubIcon from "@mui/icons-material/GitHub";
import MenuIcon from "@mui/icons-material/MenuRounded";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

const pages = [
  { label: "Home", path: "/" },
  { label: "FAQ", path: "/faq" },
  { label: "API", path: "/api" },
];

function Header() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const location = useLocation();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      position="sticky"
      color="transparent"
      sx={{
        bgcolor: "rgba(9, 9, 8, 0.92)",
        borderBottom: 1,
        borderColor: "divider",
        backdropFilter: "blur(16px)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
          <Box
            component={RouterLink}
            to="/"
            aria-label="Torch home"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              color: "text.primary",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt=""
              width={28}
              height={28}
              sx={{
                objectFit: "contain",
                filter: "drop-shadow(0 4px 8px rgba(255, 174, 32, 0.24))",
              }}
            />
            <Typography
              component="span"
              sx={{
                fontFamily: '"Fira Mono", monospace',
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "0.05em",
              }}
            >
              torch
            </Typography>
          </Box>

          <Box
            sx={{
              ml: 4,
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {pages.map((page) => (
              <Button
                key={page.path}
                component={RouterLink}
                to={page.path}
                sx={{
                  color:
                    location.pathname === page.path
                      ? "primary.main"
                      : "text.secondary",
                  px: 1.5,
                  "&:hover": {
                    color: "text.primary",
                    bgcolor: "rgba(255, 255, 255, 0.045)",
                  },
                }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          <Box flexGrow={1} />

          <Tooltip title="View source on GitHub">
            <IconButton
              component="a"
              href="https://github.com/tyruschuang/torch-minecraft"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Torch source on GitHub"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                  bgcolor: "rgba(255, 255, 255, 0.055)",
                },
              }}
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>

          <Box sx={{ display: { xs: "block", md: "none" }, ml: 0.5 }}>
            <IconButton
              aria-label="Open navigation"
              aria-controls={anchorElNav ? "mobile-navigation" : undefined}
              aria-expanded={Boolean(anchorElNav)}
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{ color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="mobile-navigation"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 180,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.path}
                  component={RouterLink}
                  to={page.path}
                  selected={location.pathname === page.path}
                  onClick={handleCloseNavMenu}
                  sx={{ minHeight: 48 }}
                >
                  <Typography fontWeight={600}>{page.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
