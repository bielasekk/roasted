import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { CircularProgress, Paper, Typography } from '@mui/material';
import { Box, Button, TextField } from '@mui/material';

const ReportTable = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5002/api/reports')
      .then((res) => res.json())
      .then((data) => {
        // Map reports to DataGrid rows 
        const mappedReports = data.map((r) => ({
          id: r.id,
          text: r.text,
          reporter: r.reporter,
          abusive_author: r.abusive_author,
          url: r.url,
          timestamp: r.timestamp,
        }));
        setReports(mappedReports);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'text', headerName: 'Text', width: 250 },
    { field: 'reporter', headerName: 'Reporter', width: 150 },
    { field: 'abusive_author', headerName: 'Abusive Author', width: 150 },
    { field: 'url', headerName: 'URL', width: 180 },
    // {
    //   field: 'url',
    //   headerName: 'URL',
    //   width: 180,
    //   renderCell: (params) => (
    //     <a href={params.value} target="_blank" rel="noopener noreferrer">
    //       Link
    //     </a>
    //   ),
    // },
    { field: 'timestamp', headerName: 'Timestamp', width: 180 },
  ];

  if (loading) return <CircularProgress />;

  return (
    <Paper sx={{ width: '100%', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Reported Posts
      </Typography>
      {/* Header controls row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search reports..."
          //   value={searchText}
          //   onChange={(e) => setSearchText(e.target.value)}
          />
        <Button
            variant="contained"
            color="primary"
          >
            Search
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            // disabled={selectedRows.length === 0}
            // onClick={() => {
            //   const selected = reports.find((r) => r.id === selectedRows[0]);
            //   if (selected?.url) {
            //     window.open(selected.url, '_blank');
            //   }
            // }}
          >
            View in Context
          </Button>
          <Button
            variant="outlined"
            color="error"
            // disabled={selectedRows.length === 0}
            // onClick={() => {
            //   const ids = selectedRows.join(', ');
            //   alert(`Delete reports: ${ids}`);
            //   // You could also send a DELETE request here
            // }}
          >
            Delete
          </Button>
        </Box>
      </Box>
      <DataGrid
        rows={reports}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Paper>
  );
};

export default ReportTable;