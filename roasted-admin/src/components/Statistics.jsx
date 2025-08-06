import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

const Statistics = () => {
  return (
    <Paper sx={{ p: 3, width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Platform Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* Left: Line Chart */}
        <Grid item xs={12} md={7}>
          <Box sx={{ height: 300 }}>
            <LineChart
              xAxis={[{ scaleType: 'point', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }]}
              series={[
                { curve: 'linear', data: [1, 5, 2, 6, 3, 9.3], label: 'User Reports' },
                { curve: 'linear', data: [6, 3, 7, 9.5, 4, 2], label: 'Resolved Reports' },
              ]}
              width={500}
              height={300}
            />
          </Box>
        </Grid>

        {/* Right: Table */}
        <Grid item xs={12} md={5}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Total Reports</TableCell>
                <TableCell align="right">128</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Resolved</TableCell>
                <TableCell align="right">93</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Pending</TableCell>
                <TableCell align="right">35</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Avg. Resolution Time</TableCell>
                <TableCell align="right">2.3 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Most Active Day</TableCell>
                <TableCell align="right">Thursday</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Statistics;
