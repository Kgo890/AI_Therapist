import * as React from "react";
import {
  AppBar, Box, Toolbar, IconButton, Typography,
  Drawer, List, ListItem, ListItemButton, ListItemText
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

export default function SearchAppBar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const navigate = useNavigate();

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const drawerItems = [
    { text: "Dashboard", route: "/dashboard" },
    { text: "Reset Password", route: "/reset-password" },
    { text: "Conversation History", route: "/history" },
    { text: "Logout", action: handleLogout },
  ];

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  }

  React.useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const res = await api.get("/auth/user-info", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsername(res.data.username || res.data.email || "");
        } catch (err) {
          console.error("Failed to load user info:", err);
        }
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: "#003b5b" }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, color: "#ffffff" }}>
            AI Therapist
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          {/* 👤 Username section */}
          <Box sx={{ padding: "16px", borderBottom: "1px solid #ccc", backgroundColor: "#f5f5f5" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              👤 {username}
            </Typography>
          </Box>

          {/* Navigation Items */}
          <List>
            {drawerItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (item.route) navigate(item.route);
                    if (item.action) item.action();
                  }}
                >
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
