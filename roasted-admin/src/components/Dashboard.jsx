import React from 'react';
import { Box, Toolbar} from '@mui/material';
import ReportTable from './ReportTable';
import Sidebar from './Sidebar';
import Header from './Header';
import Statistics from './Statistics';

const Dashboard = ({ children, isLoggedIn, onLoginToggle }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Header isLoggedIn={isLoggedIn} onLoginToggle={onLoginToggle} />
      <Sidebar />

      {/* Main content area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Dashboard;