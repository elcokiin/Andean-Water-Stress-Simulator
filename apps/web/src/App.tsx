import type { CSSProperties, ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  ClimateImpactFlow,
  DemandManagementFlow,
  PointOfNoReturnFlow,
  SimulationFlow,
} from "@proyecto-final/diagrams";
import "./App.css";

function DiagramPage({
  backHref,
  children,
}: {
  backHref?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ width: "100%", height: "100vh", margin: 0, padding: 0 }}>
      {backHref ? (
        <header style={{ padding: "1rem 1rem 0" }}>
          <a
            href={backHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "999px",
              background: "#e2e8f0",
              color: "#0f172a",
              fontSize: "0.875rem",
              fontWeight: 600,
              padding: "0.6rem 0.9rem",
              textDecoration: "none",
            }}
          >
            &larr; Volver al diagrama principal
          </a>
        </header>
      ) : null}
      {children}
      {!backHref ? (
        <nav
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            padding: "0 1rem 1rem",
          }}
        >
          <a href="/impacto-climatico" style={linkCardStyle}>
            <strong>Impacto climático</strong>
            <span>Ver el subproceso de clima.</span>
          </a>
          <a href="/gestion-demanda" style={linkCardStyle}>
            <strong>Gestión de demanda</strong>
            <span>Ver el subproceso de consumo y racionamiento.</span>
          </a>
          <a href="/punto-no-retorno" style={linkCardStyle}>
            <strong>Punto de no retorno</strong>
            <span>Ver el umbral de colapso hídrico.</span>
          </a>
        </nav>
      ) : null}
    </div>
  );
}

const linkCardStyle: CSSProperties = {
  display: "grid",
  gap: "0.35rem",
  padding: "1rem",
  textDecoration: "none",
  color: "#0f172a",
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: "1rem",
  boxShadow: "0 10px 30px rgba(14, 165, 233, 0.08)",
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <DiagramPage>
              <SimulationFlow />
            </DiagramPage>
          }
        />
        <Route
          path="/impacto-climatico"
          element={
            <DiagramPage backHref="/">
              <ClimateImpactFlow title="Subproceso de Impacto Climático" />
            </DiagramPage>
          }
        />
        <Route
          path="/gestion-demanda"
          element={
            <DiagramPage backHref="/">
              <DemandManagementFlow title="Subproceso de Gestión de Demanda" />
            </DiagramPage>
          }
        />
        <Route
          path="/punto-no-retorno"
          element={
            <DiagramPage backHref="/">
              <PointOfNoReturnFlow title="Subproceso Punto de No Retorno" />
            </DiagramPage>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
