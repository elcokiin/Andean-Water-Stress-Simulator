import { BrowserRouter, Routes, Route } from "react-router-dom";
import SimulationFlow from "./components/SimulationFlow";
import ClimateImpactFlow from "./components/ClimateImpactFlow";
import DemandManagementFlow from "./components/DemandManagementFlow";
import PointOfNoReturnFlow from "./components/PointOfNoReturnFlow";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div style={{ width: "100%", height: "100vh", margin: 0, padding: 0 }}>
        <Routes>
          <Route path="/" element={<SimulationFlow />} />
          <Route path="/impacto-climatico" element={<ClimateImpactFlow />} />
          <Route path="/gestion-demanda" element={<DemandManagementFlow />} />
          <Route path="/punto-no-retorno" element={<PointOfNoReturnFlow />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

