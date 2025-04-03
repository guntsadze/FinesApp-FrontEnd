import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Button, TextField, Grid, Box } from "@mui/material";
import * as XLSX from "xlsx"; // xlsx ბიბლიოთეკა

function ParkingFinesCarInfoForm() {
  const [vehicleNo, setVehicleNo] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [file, setFile] = useState(null);

  const API_URL = process.env.REACT_APP_API_BASE_URL;

  const columns = [
    { field: "vehicleNo", headerName: "ავტომობილის ნომერი", width: 180 },
    { field: "companyCode", headerName: "კომპანიის საიდ კოდი", width: 180 },
    {
      field: "actions",
      headerName: "Actions",
      headerAlign: "center",
      width: 250,
      renderCell: (params) => (
        <>
          <Button
            color="primary"
            onClick={() => handleEdit(params.row)}
            style={{ marginRight: "10px" }}
          >
            რედაქტირება
          </Button>
          <Button color="secondary" onClick={() => handleDelete(params.row.id)}>
            წაშლა
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    handleGetList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/ParkingFinesCarInfo/create`,
        { vehicleNo, companyCode }
      );
      setSuccessMessage(response.data.message);
      setError("");
      handleGetList();
    } catch (err) {
      console.error("Error creating car info:", err);
      setError("Error creating car info");
      setSuccessMessage("");
    }
  };

  const handleGetList = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/ParkingFinesCarInfo/getList`
      );
      setData(
        response.data.map((item) => ({ ...item, id: item._id })) // Ensure each row has a unique `id` for DataGrid
      );
      setError(""); // Clear previous errors if any
    } catch (error) {
      console.error("Error fetching car info:", error);
      setError("Error fetching car info");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/ParkingFinesCarInfo/delete/${id}`);
      setSuccessMessage("Car info deleted successfully!");
      setError("");
      handleGetList(); // Refresh data grid after deletion
    } catch (error) {
      console.error("Error deleting car info:", error);
      setError("Error deleting car info");
      setSuccessMessage("");
    }
  };

  const handleEdit = (row) => {
    setVehicleNo(row.vehicleNo);
    setCompanyCode(row.companyCode);
    setSelectedRow(row);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_URL}/ParkingFinesCarInfo/update/${selectedRow.id}`,
        { vehicleNo, companyCode }
      );
      setSuccessMessage("Car info updated successfully!");
      setError("");
      handleGetList(); // Refresh data grid after update
      setSelectedRow(null); // Reset selected row
    } catch (err) {
      console.error("Error updating car info:", err);
      setError("Error updating car info");
      setSuccessMessage("");
    }
  };

  // Excel ექსპორტის ფუნქცია
  const handleExportToExcel = () => {
    // მხოლოდ "vehicleNo" და "documentNo" ველების არჩევა
    const filteredData = data.map(({ vehicleNo, companyCode }) => ({
      vehicleNo,
      companyCode,
    }));

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Car Info");
    const currentDate = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `პარკინგი_ავტომობილების_ინფორმაცია_${currentDate}.xlsx`);
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      parseExcelFile(uploadedFile);
    }
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      importExcelData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const importExcelData = async (data) => {
    try {
      const response = await axios.get(
        `${API_URL}/ParkingFinesCarInfo/getList`
      );
      const existingData = response.data;

      const newEntries = data.filter((entry) => {
        // ამოიღეთ დეფისები "vehicleNo" ველიდან
        entry.vehicleNo = entry.vehicleNo.replace(/-/g, "");

        return !existingData.some(
          (existing) =>
            existing.vehicleNo === entry.vehicleNo &&
            existing.companyCode === entry.companyCode
        );
      });

      if (newEntries.length > 0) {
        await Promise.all(
          newEntries.map((entry) =>
            axios.post(`${API_URL}/ParkingFinesCarInfo/create}`, entry)
          )
        );
        setSuccessMessage("New entries successfully added!");
        handleGetList(); // Refresh the data grid
      } else {
        setError("No new entries to add!");
      }
    } catch (error) {
      console.error("Error importing data:", error);
      setError("Error importing data");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box>
        <h2>ავტომობილი დამატება პარკირების ჯარიმების შესამოწმებლად</h2>

        <form onSubmit={selectedRow ? handleUpdate : handleSubmit}>
          <Grid
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            container
            spacing={2}
          >
            <Grid item xs={6}>
              <TextField
                label="ავტომობილის ნომერი"
                fullWidth
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="კომპანიის საიდ კოდი"
                fullWidth
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                required
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: "20px" }}
            >
              {selectedRow ? "რედაქტირება" : "შენახვა"}
            </Button>
            <Button
              onClick={handleGetList}
              variant="outlined"
              style={{ marginTop: "20px", marginLeft: "10px" }}
            >
              შენახული მანქანები
            </Button>
            <Button
              onClick={handleExportToExcel}
              variant="contained"
              color="secondary"
              style={{ marginTop: "20px", marginLeft: "10px" }}
            >
              ექსპორტი Excel-ში
            </Button>

            <Button
              variant="contained"
              color="primary"
              component="label"
              style={{ marginTop: "20px", marginLeft: "10px" }}
            >
              იმპორტი Excel - ით
              <input
                type="file"
                accept=".xlsx, .xls"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

        <div style={{ height: 400, width: "100%", marginTop: "30px" }}>
          <DataGrid
            rows={data}
            columns={columns}
            pageSize={5}
            getRowHeight={() => 30}
            onSelectionModelChange={(newSelection) => {
              const selectedId = newSelection.selectionModel[0];
              const selectedData = data.find((row) => row.id === selectedId);
              setSelectedRow(selectedData);
              setVehicleNo(selectedData?.vehicleNo || "");
              setCompanyCode(selectedData?.companyCode || "");
            }}
          />
        </div>
      </Box>
    </Box>
  );
}

export default ParkingFinesCarInfoForm;
