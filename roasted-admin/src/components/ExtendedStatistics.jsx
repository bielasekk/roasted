import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

const extractDomain = (url) => {
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch {
    return null;
  }
};

const getLastNDays = (n) => {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    dates.push(`${day}.${month}`);
  }
  return dates;
};

const Statistics = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [daysRange, setDaysRange] = useState(7);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5002/api/reports');
        const data = await res.json();

        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - (daysRange - 1));

        const filtered = data.filter((r) => {
          const d = new Date(r.timestamp);
          return d >= startDate && d <= today;
        });

        setReports(filtered);
        setLoading(false);

        const totalReports = filtered.length;
        const flaggedReports = filtered.filter((r) => r.flag).length;
        const anonymousReports = filtered.filter((r) => r.reporter === 'Anonymous').length;
        const percentAnonymous = totalReports ? ((anonymousReports / totalReports) * 100).toFixed(1) : 0;

        // Domain frequency
        const domainsCount = {};
        filtered.forEach((r) => {
          if (r.url) {
            const domain = extractDomain(r.url);
            if (domain) domainsCount[domain] = (domainsCount[domain] || 0) + 1;
          }
        });
        const topDomains = Object.entries(domainsCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4);

        // Top reporters
        const reportersCount = {};
        filtered.forEach((r) => {
          const reporter = r.reporter || 'Anonymous';
          reportersCount[reporter] = (reportersCount[reporter] || 0) + 1;
        });
        const topReporters = Object.entries(reportersCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4);

        const lastNDays = getLastNDays(daysRange);

        const reportsByDay = lastNDays.map((dateStr) => {
          const [day, month] = dateStr.split('.');
          return filtered.filter((r) => {
            const d = new Date(r.timestamp);
            return d.getDate() === parseInt(day, 10) && d.getMonth() + 1 === parseInt(month, 10);
          }).length;
        });

        const flaggedByDay = lastNDays.map((dateStr) => {
          const [day, month] = dateStr.split('.');
          return filtered.filter((r) => r.flag &&
            new Date(r.timestamp).getDate() === parseInt(day, 10) &&
            new Date(r.timestamp).getMonth() + 1 === parseInt(month, 10)
          ).length;
        });

        const anonymousByDay = lastNDays.map((dateStr) => {
          const [day, month] = dateStr.split('.');
          return filtered.filter((r) => r.reporter === 'Anonymous' &&
            new Date(r.timestamp).getDate() === parseInt(day, 10) &&
            new Date(r.timestamp).getMonth() + 1 === parseInt(month, 10)
          ).length;
        });

        setStats({
            totalReports,
            flaggedReports,
            percentFlagged: totalReports ? ((flaggedReports / totalReports) * 100).toFixed(1) : 0,
            avgPerDay: (totalReports / daysRange).toFixed(1),
            percentAnonymous,
            topDomains: topDomains || [],
            topReporters: topReporters || [],
            lastNDays,
            reportsByDay,
            flaggedByDay,
            anonymousByDay,
        });
      } catch (err) {
        console.error('Failed to fetch reports', err);
        setLoading(false);
      }
    };

    fetchReports();
  }, [daysRange]);

  if (loading) return <CircularProgress />;
  if (!stats) return <Typography>No data</Typography>;

  return (
    <Paper sx={{ p: 3, width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Platform Statistics (Last {daysRange} Days)
      </Typography>

      <FormControl sx={{ mb: 2, minWidth: 120 }}>
        <InputLabel>Days</InputLabel>
        <Select value={daysRange} label="Days" onChange={(e) => setDaysRange(e.target.value)}>
          <MenuItem value={7}>7</MenuItem>
          <MenuItem value={14}>14</MenuItem>
          <MenuItem value={30}>30</MenuItem>
        </Select>
      </FormControl>

      <Grid container spacing={5}>
        {/* Line Chart */}
        <Grid item xs={12} md={7}>
          <Box sx={{ width: '100%', height: 300, mb: 4 }}>
            <LineChart
              xAxis={[{ scaleType: 'point', data: stats.lastNDays }]}
              series={[
                { curve: 'linear', data: stats.reportsByDay, label: 'Total Reports' },
                { curve: 'linear', data: stats.flaggedByDay, label: 'Flagged Reports' },
                { curve: 'linear', data: stats.anonymousByDay, label: 'Anonymous Reports' },
              ]}
              width={1000}
              height={300}
            />
          </Box>
        </Grid>

        {/* General Stats */}
        <Grid container spacing={20}>
        <Grid item xs={12} md={5}>
          <Typography variant="subtitle1" gutterBottom>
            General
          </Typography>
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
                <TableCell align="right">{stats.totalReports}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Flagged Reports</TableCell>
                <TableCell align="right">{stats.flaggedReports} ({stats.percentFlagged}%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Average Reports per Day</TableCell>
                <TableCell align="right">{stats.avgPerDay}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Anonymous Reports</TableCell>
                <TableCell align="right">{stats.percentAnonymous}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>

        {/* Top Domains */}
        <Grid item xs={12} md={5}>
          <Typography variant="subtitle1" gutterBottom>
            Top Domains
          </Typography>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Domain</TableCell>
                <TableCell align="right">Reports</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.topDomains.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">No domains</TableCell>
                </TableRow>
              ) : (
                stats.topDomains.map(([domain, count]) => (
                  <TableRow key={domain}>
                    <TableCell>{domain}</TableCell>
                    <TableCell align="right">{count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Grid>

        {/* Top Reporters */}
        <Grid item xs={12} md={5}>
          <Typography variant="subtitle1" gutterBottom>
            Top Reporters
          </Typography>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Reporter</TableCell>
                <TableCell align="right">Reports</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.topReporters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">No reporters</TableCell>
                </TableRow>
              ) : (
                stats.topReporters.map(([reporter, count]) => (
                  <TableRow key={reporter}>
                    <TableCell>{reporter}</TableCell>
                    <TableCell align="right">{count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
      </Grid>
    </Paper>
  );
};

export default Statistics;


