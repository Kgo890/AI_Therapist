import * as React from "react";
import {
  AppBar, Box, Toolbar, IconButton, Typography,
  Drawer, List, ListItem, ListItemButton, ListItemText
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import api from "../auth/axios";

export default function SearchAppBar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [savedPages, setSavedPages] = React.useState([]);
  const navigate = useNavigate();

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  React.useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      api.get("/auth/saved-pages", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSavedPages(res.data.saved_pages || []))
      .catch((err) => console.error("Failed to load saved pages:", err));
    }
  }, []);

  const drawerItems = [
    { text: "Dashboard", route: "/dashboard" },
    { text: "Reset Password", route: "/reset-password" },
    {text: "Conversation History" route: "/history"},
    { text: "Logout", action: handleLogout },
  ];

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large" edge="start" color="inherit"
            aria-label="menu" sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            DCU News Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
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