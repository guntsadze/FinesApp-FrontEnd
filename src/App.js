import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import PoliceFines from "./(routes)/PoliceFines";
import ParkingFines from "./(routes)/ParkingFines";
import PoliceFinesCarInfoForm from "./(routes)/PoliceFinesCarInfoForm";
import ParkingFinesCarInfoForm from "./(routes)/ParkingFinesCarInfoForm";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Button, Box } from "@mui/material";

import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import LocalCarWashIcon from "@mui/icons-material/LocalCarWash";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        gap={2}
        mt={2}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={2}
          mt={2}
        >
          <Link to="/policeFines">
            <Button variant="contained" startIcon={<LocalPoliceIcon />}>
              პოლიციის ჯარიმები
            </Button>
          </Link>
          <Link to="/policeFinesCarInfo">
            <Button variant="contained" startIcon={<LocalCarWashIcon />}>
              პოლიციის ჯარიმებისთვის ავტომობილის ინფორმაცის დამატება
            </Button>
          </Link>
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={2}
          mt={2}
        >
          <Link to="/parkingFines">
            <Button variant="contained" startIcon={<LocalParkingIcon />}>
              პარკინგის ჯარიმები
            </Button>
          </Link>
          <Link to="/parkingFinesCarInfo">
            <Button variant="contained" startIcon={<DirectionsCarFilledIcon />}>
              პარკინგის ჯარიმებისთვის ავტომობილის ინფორმაცის დამატება
            </Button>
          </Link>
        </Box>
      </Box>
      <Routes>
        <Route path="/policeFines" element={<PoliceFines />} />
        <Route path="/parkingFines" element={<ParkingFines />} />
        <Route
          path="/policeFinesCarInfo"
          element={<PoliceFinesCarInfoForm />}
        />
        <Route
          path="/parkingFinesCarInfo"
          element={<ParkingFinesCarInfoForm />}
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
