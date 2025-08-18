import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Box, TextField, IconButton, CircularProgress, Typography, Paper } from "@mui/material";
import { saveAs } from "file-saver";
import FlagIcon from "@mui/icons-material/Flag";
import FlagOutlinedIcon from "@mui/icons-material/OutlinedFlag";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const ExtendedReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    fetch("http://localhost:5002/api/reports")
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(r => ({
          id: r.id,
          text: r.text,
          reporter: r.reporter,
          abusive_author: r.abusive_author,
          url: r.url,
          timestamp: r.timestamp,
          flag: r.flag
        }));
        setReports(mapped);
        setFilteredReports(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Date filtering
  useEffect(() => {
    let temp = [...reports];

    if (startDate) temp = temp.filter(r => new Date(r.timestamp) >= new Date(startDate));
    if (endDate) temp = temp.filter(r => new Date(r.timestamp) <= new Date(endDate));

    setFilteredReports(temp);
  }, [startDate, endDate, reports]);


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
  setSearchText("");
  
  // Reapply only date filters
  let temp = [...reports];
  if (startDate) temp = temp.filter(r => new Date(r.timestamp) >= new Date(startDate));
  if (endDate) temp = temp.filter(r => new Date(r.timestamp) <= new Date(endDate));
  
  setFilteredReports(temp);
};

  const toggleFlag = async (id) => {
    try {
      await fetch(`http://localhost:5002/api/reports/flag/${id}`, { method: "POST" });
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedRows.length) return;
    if (!window.confirm(`Delete reports: ${selectedRows.join(", ")}?`)) return;
    try {
      await fetch("http://localhost:5002/api/reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRows }),
      });
      setSelectedRows([]);
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ["ID", "Text", "Reporter", "Abusive Author", "URL", "Timestamp", "Flag"],
      ...filteredReports.map(r => [
        r.id, r.text, r.reporter, r.abusive_author, r.url, r.timestamp, r.flag ? "Yes" : "No"
      ])
    ]
      .map(row => row.map(value => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "reports.csv");
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "text", headerName: "Text", width: 250, sortable: true },
    { field: "reporter", headerName: "Reporter", width: 150, sortable: true },
    { field: "abusive_author", headerName: "Abusive Author", width: 150 },
    {
      field: "url",
      headerName: "Link",
      width: 140,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          endIcon={<OpenInNewIcon />}
          onClick={() => window.open(params.value, "_blank", "noopener,noreferrer")}
        >
          Open
        </Button>
      ),
    },
    { field: "timestamp", headerName: "Timestamp", width: 180, sortable: true },
    {
      field: "flag",
      headerName: "Flag",
      width: 80,
      sortable: true,
      renderCell: (params) => (
        <IconButton onClick={() => toggleFlag(params.row.id)} color={params.value ? "error" : "default"}>
          {params.value ? <FlagIcon /> : <FlagOutlinedIcon />}
        </IconButton>
      ),
    },
  ];

  if (loading) return <CircularProgress />;

  return (
    <Paper sx={{ width: "100%", p: 2 }}>
    <Box>
      <Typography variant="h6" gutterBottom>
        Reports
      </Typography>

      {/* Top row: Search */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
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
        </Box>

      {/* Second row: Filters & Actions */}
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          type="date"
          label="Start Date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          size="small"
          type="date"
          label="End Date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
     </Box>
        <Box sx={{ display: "flex", gap: 1}}>
           <Button 
            size="small" 
            variant="outlined" 
            sx={{ height: 40, minWidth: "auto", px: 2 }} 
            onClick={exportCSV}>
                Export CSV
            </Button>
            <Button 
                size="small" 
                variant="outlined" 
                color="error" 
                sx={{ height: 40, minWidth: "auto", px: 2 }} 
                onClick={handleDelete} 
                disabled={selectedRows.length === 0}>
            Delete Selected
            </Button>
      </Box>
    </Box>

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredReports}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelection) => {
            const selectedIds = Array.from(newSelection.ids || []);
            setSelectedRows(selectedIds);
          }}
        />
      </div>
    </Box>
    </Paper>
  );
};

export default ExtendedReports;
