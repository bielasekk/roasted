import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
} from '@mui/material';

const Header = ({ isLoggedIn, onLoginToggle }) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'primary.main',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left: Logo + App title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            variant="square"
            src="/roasted.png"
            alt="Roasted Logo"
            sx={{ width: 32, height: 32 }}
          />
          <Typography variant="h6" noWrap component="div">
            Roasted
          </Typography>
        </Box>

        {/* Right: Logout only when logged in */}
        {isLoggedIn && (
          <Button
            color="inherit"
            onClick={onLoginToggle}
            variant="outlined"
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'lightgray',
              },
            }}
          >
            Log Out
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;