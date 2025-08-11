import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { CircularProgress, Paper, Typography, Box, Button, TextField, IconButton } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import FlagOutlinedIcon from '@mui/icons-material/OutlinedFlag';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const ReportTable = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    fetch('http://localhost:5002/api/reports')
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setFilteredReports(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearch = () => {
    const lower = searchText.toLowerCase();
    setFilteredReports(
      reports.filter((r) =>
        Object.values(r).some((val) =>
          String(val).toLowerCase().includes(lower)
        )
      )
    );
  };

  const handleClearSearch = () => {
    setSearchText('');
    setFilteredReports(reports);
  };

  const toggleFlag = async (id) => {
    try {
      await fetch(`http://localhost:5002/api/reports/flag/${id}`, { method: 'POST' });
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) return;
    if (!window.confirm(`Delete reports: ${selectedRows.join(', ')}?`)) return;
    try {
      await fetch('http://localhost:5002/api/reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRows }),
      });
      setSelectedRows([]);
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'text', headerName: 'Text', width: 250 },
    { field: 'reporter', headerName: 'Reporter', width: 150 },
    { field: 'abusive_author', headerName: 'Abusive Author', width: 150 },
    {
  field: 'url',
  headerName: 'Link',
  width: 140,
  renderCell: (params) => (
    <Button
      variant="outlined"
      size="small"
      endIcon={<OpenInNewIcon />}
      onClick={() => window.open(params.value, '_blank', 'noopener,noreferrer')}
    >
      Open
    </Button>
  ),
},
    { field: 'timestamp', headerName: 'Timestamp', width: 180 },
    {
      field: 'flag',
      headerName: 'Flag',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton onClick={() => toggleFlag(params.row.id)} color={params.value ? 'error' : 'default'}>
          {params.value ? <FlagIcon /> : <FlagOutlinedIcon />}
        </IconButton>
      ),
    },
  ];

  if (loading) return <CircularProgress />;

  return (
    <Paper sx={{ width: '100%', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Reported Posts
      </Typography>

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search reports..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
          <Button variant="outlined" onClick={handleClearSearch} disabled={!searchText}>
            Clear
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            disabled={selectedRows.length === 0}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Data Table */}
      <DataGrid
        rows={filteredReports}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 5 } },
        }}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={(newSelection) => {
            const selectedIds = Array.from(newSelection.ids || []);
            setSelectedRows(selectedIds);
        }}
      />
    </Paper>
  );
};

export default ReportTable;
