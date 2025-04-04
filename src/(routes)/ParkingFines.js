import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import { Dialog, DialogTitle, DialogContent, Box } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";

function ParkingFines() {
  const [error, setError] = useState("");
  const [allFines, setAllFines] = useState([]);
  const [finesData, setFinesData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState({});

  const API_URL = process.env.REACT_APP_API_BASE_URL;

  console.log(finesData);

  const getListCarInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/ParkingFines/getList`);

      const vehiclesWithFines = response.data.reduce((acc, vehicle) => {
        const fines = vehicle.parkingFines || [];
        fines.forEach((fine) => {
          acc.push({
            id: vehicle._id,
            vehicle: vehicle.vehicles,
            createDate: fine.createDate,
            fineNumber: fine.fineNumber,
            status: fine.status,
            amount: fine.payAmount,
          });
        });

        return acc;
      }, []);

      setFinesData(vehiclesWithFines);
    } catch (error) {
      console.error("Error fetching car info:", error);
      setError("Error fetching car info");
    }
  };

  const getCarDocInfo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/ParkingFinesCarInfo/getList`
      );

      const vehicles = response.data.map((item) => ({
        vehicleNo: item.vehicleNo,
        companyCode: item.companyCode,
      }));

      setVehicles(vehicles);
    } catch (error) {
      console.error("Error fetching car info:", error);
      setError("Error fetching car info");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([getListCarInfo(), getCarDocInfo()]);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (allFines.length > 0) {
        await handleSaveFines();
        await getListCarInfo();
      }
    };

    fetchData();
  }, [allFines]);

  const handleSearch = async () => {
    setLoadingStatus({});
    setIsSearching(true);

    try {
      const updatedFines = [];

      for (const vehicle of vehicles) {
        setLoadingStatus((prev) => ({
          ...prev,
          [vehicle.vehicleNo]: "შემოწმება მიმდინარეობს...",
        }));

        const response = await axios.post(`${API_URL}/parkingCheckFines`, {
          vehicles: [vehicle],
        });

        updatedFines.push(...response.data);

        setLoadingStatus((prev) => ({
          ...prev,
          [vehicle.vehicleNo]:
            response.data.length > 0
              ? "ჯარიმები ნაპოვნია ✅"
              : "ჯარიმები არ არის❌",
        }));
      }

      setAllFines(updatedFines);
      setIsSearching(false);

      setError("");
    } catch (error) {
      console.error("Error fetching fines:", error);
      setError("Error fetching fines");
    }
  };

  const handleExportToExcel = () => {
    // Remove the 'id' field from each item in the finesData array
    const exelData = finesData.map(
      ({ id, vehicle, fineNumber, createDate, amount, status }) => ({
        "ავტომობილის ნომერი": vehicle,
        "ქვითრის ნომერი": fineNumber,
        "ჯარიმის თარიღი": createDate,
        თანხა: amount,
        სტატუსი: status,
      })
    );

    // Create a worksheet from the data without the 'id' field
    const ws = XLSX.utils.json_to_sheet(exelData);

    // Create a new workbook and append the worksheet to it
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "პარკირების ჯარიმები");
    const currentDate = new Date().toISOString().split("T")[0];
    // Export the workbook to an Excel file
    XLSX.writeFile(wb, `პარკირების_ჯარიმები_${currentDate}.xlsx`);
  };

  const handleSaveFines = async () => {
    try {
      // მოძებნოს მანქანები, რომლებსაც აქვთ ახალი ჯარიმები
      const vehiclesWithNewFines = allFines
        .map((vehicle) => {
          const newFines = vehicle.parkingFines.filter(
            (fine) =>
              !finesData.some(
                (existingFine) => existingFine.fineNumber === fine.fineNumber
              )
          );

          // თუ ახალი ჯარიმები არ არის, გამოვტოვოთ ეს მანქანა
          if (newFines.length === 0) return null;

          return {
            id: vehicle._id,
            vehicles: vehicle.vehicles,
            parkingFines: newFines,
          };
        })
        .filter(Boolean); // ფილტრავს `null`-ებს (მანქანებს, რომლებსაც არ აქვთ ახალი ჯარიმები)

      console.log("ახალი ჯარიმები მანქანების მიხედვით:", vehiclesWithNewFines);

      if (vehiclesWithNewFines.length > 0) {
        const response = await axios.post(
          `${API_URL}/ParkingFines/create`,
          vehiclesWithNewFines
        );
        console.log("Success: ", response.data);
        setError(""); // წაშალოს წინა შეცდომები
      } else {
        setError("არ არსებობს ახალი ჯარიმები დასამატებლად");
      }
    } catch (error) {
      console.error("შეცდომა ჯარიმების შენახვისას:", error);
      setError("შეცდომა ჯარიმების შენახვისას");
    }
  };

  const columns = [
    { field: "vehicle", headerName: "ავტომობილის ნომერი", width: 180 },
    { field: "fineNumber", headerName: "ქვითრის ნომერი", width: 180 },
    { field: "createDate", headerName: "გამოშვების თარიღი", width: 180 },
    { field: "status", headerName: "სტატუსი", width: 250 },
    { field: "amount", headerName: "თანხა", width: 180 },
  ];

  return (
    <Box sx={{ width: "95vw" }}>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box>
          <div sx={{ width: "100%" }}>
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              პარკირების ჯარიმები
            </h2>
          </div>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <SearchIcon
              sx={{ cursor: "pointer", m: 1 }}
              fontSize="large"
              onClick={handleSearch}
            />
            <GetAppIcon
              sx={{ cursor: "pointer", m: 1 }}
              fontSize="large"
              onClick={handleExportToExcel}
            />
          </Box>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <DataGrid
            rows={finesData}
            columns={columns}
            rowHeight={30}
            getRowId={(row) => `${row.id}-${row.fineNumber}`}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 15, page: 0 }, // აქ getRowHeight არ უნდა იყოს!
              },
            }}
            pageSizeOptions={[5, 10, 15, 20, 50, 100]}
          />
        </Box>
        <Dialog open={isSearching} maxWidth="xl" fullWidth>
          <DialogTitle>მიმდინარეობს ჯარიმების ძებნა...</DialogTitle>
          <DialogContent sx={{ width: "100%" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "5px",
              }}
            >
              {vehicles.map((vehicle) => (
                <p
                  style={{
                    border: "1px dashed wheat",
                    padding: "0.5rem",
                    width: "330px",
                  }}
                  key={vehicle.vehicleNo}
                >
                  {vehicle.vehicleNo} -{" "}
                  {loadingStatus[vehicle.vehicleNo] || "ელოდება შემოწმებას..."}
                </p>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}

export default ParkingFines;
