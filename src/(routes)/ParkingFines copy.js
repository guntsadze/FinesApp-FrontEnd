import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

function ParkingFines() {
  const [allFines, setAllFines] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/parkingCheckFines"
      );

      setAllFines(response.data);
      setError("");
    } catch (error) {
      console.error("შეცდომა ჯარიმების წამოღებისას:", error);
      setError("შეცდომა ჯარიმების წამოღებისას");
    }
  };

  const exportToExcel = () => {
    const data = [];

    allFines.forEach((vehicleData) => {
      vehicleData.parkingFines.forEach((fine) => {
        data.push({
          "მანქანის ნომერი": vehicleData.vehicle,
          "ჯარიმის ნომერი": fine.fineNumber,
          "შემოღების თარიღი": fine.createDate,
          "გადახდის თანხა": fine.payAmount,
          სტატუსი: fine.status,
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fines");

    XLSX.writeFile(wb, "პარკირების-ჯარიმები.xlsx");
  };

  return (
    <div style={{ marginBottom: "40px" }}>
      <h2>პარკინგის ჯარიმები</h2>
      <button onClick={handleSearch} style={{ marginBottom: "20px" }}>
        ძებნა
      </button>
      <button
        onClick={exportToExcel}
        style={{ marginBottom: "20px", marginLeft: "10px" }}
      >
        ექსელში ექსპორტი
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {allFines.map((vehicleData) => (
        <div key={vehicleData.vehicle} style={styles.vehicleCard}>
          <h3 style={styles.vehicleHeader}>მანქანა: {vehicleData.vehicle}</h3>
          {vehicleData.parkingFines.length > 0 ? (
            vehicleData.parkingFines.map((fine, index) => (
              <div key={index} style={styles.fineCard}>
                <p>
                  <strong>ჯარიმის ნომერი:</strong> {fine.fineNumber}
                </p>
                <p>
                  <strong>შემოღების თარიღი:</strong> {fine.createDate}
                </p>
                <p>
                  <strong>გადახდის თანხა:</strong> {fine.payAmount}
                </p>
                <p>
                  <strong>სტატუსი:</strong> {fine.status}
                </p>
              </div>
            ))
          ) : (
            <p>ჯარიმები არ არის</p>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  vehicleCard: {
    border: "2px solid #4CAF50",
    borderRadius: "8px",
    padding: "15px",
    margin: "20px 0",
    backgroundColor: "#f0fdf4",
  },
  vehicleHeader: {
    marginBottom: "10px",
    color: "#256029",
  },
  fineCard: {
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#fff",
  },
};

export default ParkingFines;
