import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

// Utility to extract domain from URL
const extractDomain = (url) => {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return null;
  }
};

// Helper to format last 7 days dates as "DD.MM"
const getLast7Days = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    dates.push(`${day}.${month}`);
  }
  return dates;
};

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5002/api/reports");
        const data = await res.json();

        // Filter reports for last 7 days only
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6);

        const filtered = data.filter((r) => {
          const reportDate = new Date(r.timestamp);
          return reportDate >= sevenDaysAgo && reportDate <= today;
        });

        setLoading(false);

        // Calculate stats
        const totalReports = filtered.length;
        const flaggedReports = filtered.filter((r) => r.flag).length;
        const avgPerDay = totalReports / 7;
        const anonymousReports = filtered.filter((r) => r.reporter === "Anonymous").length;
        const percentAnonymous = totalReports ? ((anonymousReports / totalReports) * 100).toFixed(1) : 0;

        // Count reports with URLs and domains frequency
        const domainsCount = {};
        filtered.forEach((r) => {
          if (r.url) {
            const domain = extractDomain(r.url);
            if (domain) {
              domainsCount[domain] = (domainsCount[domain] || 0) + 1;
            }
          }
        });
        const sortedDomains = Object.entries(domainsCount).sort((a, b) => b[1] - a[1]);
        const topDomains = sortedDomains.slice(0, 4);

        // Count reports per day for chart
        const last7Days = getLast7Days();
        const reportsByDay = last7Days.map((dateStr) => {
          // dateStr like '11.08'
          // parse to actual date for matching
          const [day, month] = dateStr.split(".");
          return filtered.filter((r) => {
            const d = new Date(r.timestamp);
            return (
              d.getDate() === parseInt(day, 10) &&
              d.getMonth() + 1 === parseInt(month, 10)
            );
          }).length;
        });

        setStats({
          totalReports,
          flaggedReports,
          percentFlagged: totalReports ? ((flaggedReports / totalReports) * 100).toFixed(1) : 0,
          avgPerDay: avgPerDay.toFixed(1),
          percentAnonymous,
          topDomains,
          last7Days,
          reportsByDay,
        });
      } catch (err) {
        console.error("Failed to fetch reports", err);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <CircularProgress />;

  if (!stats) return <Typography>No data</Typography>;

  return (
    <Paper sx={{ p: 3, width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Platform Statistics (Last 7 Days)
      </Typography>

      <Grid container spacing={3}>
        {/* Left: Line Chart */}
        <Grid item xs={12} md={7}>
          <Box sx={{ height: 300 }}>
            <LineChart
              xAxis={[{ scaleType: "point", data: stats.last7Days }]}
              series={[
                { curve: "linear", data: stats.reportsByDay, label: "User Reports" },
              ]}
              width={500}
              height={300}
            />
          </Box>
        </Grid>

        {/* Right: Table */}
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
                {(!stats.topDomains || stats.topDomains.length === 0) ? (
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
      </Grid>
    </Paper>
  );
};

export default Statistics;