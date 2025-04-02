import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { DataGrid } from "@mui/x-data-grid";

function PoliceFines() {
  const [error, setError] = useState("");
  const [allFines, setAllFines] = useState([]);
  const [finesData, setFinesData] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  console.log("allFines", allFines);

  const getListCarInfo = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/policeFines/getList"
      );
      const vehiclesWithFines = response.data.reduce((acc, vehicle) => {
        const fines = vehicle.fines || [];
        fines.forEach((fine) => {
          acc.push({
            id: vehicle._id,
            vehicleNo: vehicle.vehicleNo,
            receiptNumber: fine.receiptNumber,
            issueDate: fine.issueDate,
            article: fine.article,
            amount: fine.amount,
            status: fine.status,
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
        "http://localhost:5000/api/PoliceFinesCarInfo/getList"
      );

      const vehicles = response.data.map((item) => ({
        vehicleNo: item.vehicleNo,
        documentNo: item.documentNo,
      }));

      setVehicles(vehicles);
    } catch (error) {
      console.error("Error fetching car info:", error);
      setError("Error fetching car info");
    }
  };

  useEffect(() => {
    getListCarInfo();
    getCarDocInfo();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/policeCheckFines",
        { vehicles: vehicles }
      );
      setAllFines(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching fines:", error);
      setError("Error fetching fines");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (allFines.length > 0) {
        await handleSaveFines(); // Make sure handleSaveFines completes first
        await getListCarInfo(); // Then proceed to getListCarInfo
      }
    };

    fetchData();
  }, [allFines]);

  const handleExportToExcel = () => {
    // Remove the 'id' field from each item in the finesData array
    const exelData = finesData.map(
      ({
        id,
        vehicleNo,
        receiptNumber,
        issueDate,
        article,
        amount,
        status,
      }) => ({
        "ავტომობილის ნომერი": vehicleNo,
        "ქვითრის ნომერი": receiptNumber,
        "ჯარიმის თარიღი": issueDate,
        მუხლი: article,
        თანხა: amount,
        სტატუსი: status,
      })
    );

    // Create a worksheet from the data without the 'id' field
    const ws = XLSX.utils.json_to_sheet(exelData);

    // Create a new workbook and append the worksheet to it
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "პოლიციის ჯარიმები");
    const currentDate = new Date().toISOString().split("T")[0];
    // Export the workbook to an Excel file
    XLSX.writeFile(wb, `პოლიციის_ჯარიმები_${currentDate}.xlsx`);
  };

  const handleSaveFines = async () => {
    try {
      // მოძებნოს მანქანები, რომლებსაც აქვთ ახალი ჯარიმები
      const vehiclesWithNewFines = allFines
        .map((vehicle) => {
          const newFines = vehicle.fines.filter(
            (fine) =>
              !finesData.some(
                (existingFine) =>
                  existingFine.receiptNumber === fine.receiptNumber
              )
          );

          // თუ ახალი ჯარიმები არ არის, გამოვტოვოთ ეს მანქანა
          if (newFines.length === 0) return null;

          return {
            id: vehicle._id,
            documentNo: vehicle.documentNo,
            vehicleNo: vehicle.vehicleNo,
            fines: newFines, // ✅ **fines უნდა იყოს მასივი**
          };
        })
        .filter(Boolean); // ფილტრავს `null`-ებს (მანქანებს, რომლებსაც არ აქვთ ახალი ჯარიმები)

      console.log("ახალი ჯარიმები მანქანების მიხედვით:", vehiclesWithNewFines);

      if (vehiclesWithNewFines.length > 0) {
        const response = await axios.post(
          "http://localhost:5000/api/policeFines/create",
          vehiclesWithNewFines // ✅ ახლა ჯარიმები მასივად იგზავნება
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
    { field: "vehicleNo", headerName: "ავტომობილის ნომერი", width: 180 },
    { field: "receiptNumber", headerName: "ბილეთის ნომერი", width: 180 },
    { field: "issueDate", headerName: "გამოშვების თარიღი", width: 180 },
    { field: "article", headerName: "მუხლი", width: 180 },
    { field: "status", headerName: "სტატუსი", width: 250 },
    { field: "amount", headerName: "თანხა", width: 180 },
  ];

  return (
    <div>
      <h2>პოლიციის ჯარიმები</h2>
      <button onClick={handleSearch} style={{ marginBottom: "20px" }}>
        ძებნა
      </button>
      <button onClick={handleExportToExcel} style={{ marginBottom: "20px" }}>
        ექსპორტი Excel-ში
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <DataGrid
        rows={finesData}
        columns={columns}
        pageSize={5}
        getRowId={(row) => row.id}
      />
    </div>
  );
}

export default PoliceFines;
