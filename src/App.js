import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import PoliceFines from "./(routes)/PoliceFines";
import ParkingFines from "./(routes)/ParkingFines";
import PoliceFinesCarInfoForm from "./(routes)/PoliceFinesCarInfoForm";
import ParkingFinesCarInfoForm from "./(routes)/ParkingFinesCarInfoForm";

function App() {
  return (
    <>
      <Link to="/policeFines">
        <button>პოლიციის ჯარიმები</button>
      </Link>
      <Link to="/parkingFines">
        <button>პარკინგის ჯარიმები</button>
      </Link>
      <Link to="/policeFinesCarInfo">
        <button>პოლიციის ჯარიმებისთვის ავტომობილის ინფორმაცის დამატება</button>
      </Link>
      <Link to="/parkingFinesCarInfo">
        <button>პარკინგის ჯარიმებისთვის ავტომობილის ინფორმაცის დამატება</button>
      </Link>
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
    </>
  );
}
export default App;
