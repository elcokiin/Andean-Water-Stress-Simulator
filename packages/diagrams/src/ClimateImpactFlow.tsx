import { useCallback, type CSSProperties, type ReactNode } from "react";
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, addEdge, MarkerType, BackgroundVariant } from "@xyflow/react";
import type { Connection, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type DiagramProps = {
  height?: CSSProperties["height"];
  title?: string;
};

const flow = {
  forward: "#0ea5e9",
  nino: "#ef4444",     // Red for El Niño
  nina: "#3b82f6",     // Blue for La Niña
  neutral: "#22c55e",  // Green for Neutral
  toEnd: "#8b5cf6",
  strokeWidth: 2.25,
} as const;

const marker = (color: string) =>
  ({ type: MarkerType.ArrowClosed, color, width: 22, height: 22 }) as const;

const forwardEdge = {
  style: { stroke: flow.forward, strokeWidth: flow.strokeWidth },
  markerEnd: marker(flow.forward),
};

const edgeLabel = {
  labelStyle: { fill: "#0f172a", fontWeight: 600, fontSize: 13 },
  labelBgStyle: { fill: "#fff", fillOpacity: 0.95 },
  labelBgPadding: [6, 4] as [number, number],
  labelBgBorderRadius: 8,
};

const baseNodeStyle = {
  background: "#f0f9ff",
  border: "2px solid #7dd3fc",
  color: "#0c4a6e",
  borderRadius: 8,
  padding: 10,
  fontSize: "12px",
  width: 180,
  textAlign: "center" as const,
};

type NodeData = { label: ReactNode };
const getLabel = (node: { data: unknown }): ReactNode => (node.data as NodeData).label;

const initialNodes = [
  {
    id: "start",
    data: { label: "Inicio Subproceso Clima" },
    position: { x: 340, y: 50 },
    style: { ...baseNodeStyle, borderRadius: "50%", width: 140, height: 60, display: "flex", alignItems: "center", justifyContent: "center" },
  },
  {
    id: "input_time",
    data: { label: "Recibir el Tiempo actual de simulación (t)" },
    position: { x: 280, y: 200 },
    style: { ...baseNodeStyle, width: 260 },
  },
  {
    id: "search_table",
    data: { label: "Buscar el tiempo (t) en la Tabla de Datos del Índice ONI" },
    position: { x: 280, y: 350 },
    style: { ...baseNodeStyle, width: 260 },
  },
  {
    id: "interpolate",
    data: { label: "Calcular ONI mediante Interpolación Lineal" },
    position: { x: 280, y: 500 },
    style: { ...baseNodeStyle, width: 260, background: "#f3e8ff", borderColor: "#c084fc", color: "#6b21a8" },
  },
  {
    id: "decision_nino",
    data: { label: "¿El ONI es >= 0.5?" },
    position: { x: 300, y: 650 },
    style: { ...baseNodeStyle, width: 200, background: "#fef3c7", borderColor: "#fcd34d" },
  },
  {
    id: "el_nino",
    data: { label: "Activar Fase El Niño: Reducir Precipitación y Aumentar Temperatura" },
    position: { x: 50, y: 850 },
    style: { ...baseNodeStyle, width: 280, background: "#fef2f2", borderColor: "#fca5a5", color: "#7f1d1d" },
  },
  {
    id: "decision_nina",
    data: { label: "¿El ONI es <= -0.5?" },
    position: { x: 500, y: 850 },
    style: { ...baseNodeStyle, width: 200, background: "#fef3c7", borderColor: "#fcd34d" },
  },
  {
    id: "la_nina",
    data: { label: "Activar Fase La Niña: Aumentar Precipitación Base" },
    position: { x: 50, y: 1050 },
    style: { ...baseNodeStyle, width: 260, background: "#eff6ff", borderColor: "#93c5fd", color: "#1e3a8a" },
  },
  {
    id: "neutral",
    data: { label: "Fase Neutral: Mantener Precipitación y Temperatura Históricas" },
    position: { x: 500, y: 1050 },
    style: { ...baseNodeStyle, width: 280, background: "#f0fdf4", borderColor: "#86efac", color: "#14532d" },
  },
  {
    id: "calculate",
    data: { label: "Calcular Caudal de Entrada modificado y Tasa de Evaporación" },
    position: { x: 280, y: 1250 },
    style: { ...baseNodeStyle, width: 280 },
  },
  {
    id: "output",
    data: { label: "Retornar Caudal de Entrada y Tasa de Evaporación" },
    position: { x: 280, y: 1400 },
    style: { ...baseNodeStyle, width: 280 },
  },
  {
    id: "end",
    data: { label: "Fin Subproceso Clima" },
    position: { x: 340, y: 1550 },
    style: { ...baseNodeStyle, borderRadius: "50%", width: 140, height: 60, display: "flex", alignItems: "center", justifyContent: "center" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "start", target: "input_time", ...forwardEdge },
  { id: "e2", source: "input_time", target: "search_table", ...forwardEdge },
  { id: "e3", source: "search_table", target: "interpolate", ...forwardEdge },
  { id: "e4", source: "interpolate", target: "decision_nino", ...forwardEdge },
  { 
    id: "e5", 
    source: "decision_nino", 
    target: "el_nino", 
    label: "Sí",
    style: { stroke: flow.nino, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.nino),
    ...edgeLabel 
  },
  { 
    id: "e6", 
    source: "decision_nino", 
    target: "decision_nina", 
    label: "No",
    style: { stroke: flow.forward, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.forward),
    ...edgeLabel 
  },
  { 
    id: "e7", 
    source: "decision_nina", 
    target: "la_nina", 
    label: "Sí",
    style: { stroke: flow.nina, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.nina),
    ...edgeLabel 
  },
  { 
    id: "e8", 
    source: "decision_nina", 
    target: "neutral", 
    label: "No",
    style: { stroke: flow.neutral, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.neutral),
    ...edgeLabel 
  },
  { id: "e9", source: "el_nino", target: "calculate", ...forwardEdge },
  { id: "e10", source: "neutral", target: "calculate", ...forwardEdge },
  { id: "e11", source: "la_nina", target: "calculate", ...forwardEdge },
  { id: "e12", source: "calculate", target: "output", ...forwardEdge },
  { id: "e13", source: "output", target: "end", ...forwardEdge },
];

const defaultEdgeOptions = {
  style: { stroke: flow.forward, strokeWidth: flow.strokeWidth },
  markerEnd: marker(flow.forward),
};

export default function ClimateImpactFlow({
  height = "calc(100vh - 8rem)",
  title = "Subproceso de Impacto Climático",
}: DiagramProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const displayNodes = nodes.map((node) => {
    if (node.id.startsWith("decision")) {
      return {
        ...node,
        data: {
          label: (
            <div
              style={{
                transform: "rotate(45deg)",
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)",
                border: "2px solid #fbbf24",
                color: "#78350f",
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              <div style={{ transform: "rotate(-45deg)", textAlign: "center" }}>
                {getLabel(node)}
              </div>
            </div>
          ),
        },
        style: {
          ...node.style,
          width: 140,
          height: 140,
          background: "transparent",
          border: "none",
          padding: 0,
        }
      };
    }
    if (node.id === "input_time" || node.id === "output") {
      return {
        ...node,
        data: {
          label: (
            <div
              style={{
                transform: "skew(-10deg)",
                background: node.id === "output" 
                  ? "linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)"
                  : "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                border: `2px solid ${node.id === "output" ? "#eab308" : "#fb923c"}`,
                color: node.id === "output" ? "#713f12" : "#9a3412",
                padding: "10px",
                borderRadius: 8,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ transform: "skew(10deg)" }}>{getLabel(node)}</div>
            </div>
          ),
        },
        style: {
          ...node.style,
          background: "transparent",
          border: "none",
          padding: 0,
        }
      };
    }
    if (node.id === "start" || node.id === "end") {
      return {
        ...node,
        style: {
          ...node.style,
          background: node.id === "start"
            ? "linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)"
            : "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)",
          border: `2px solid ${node.id === "start" ? "#34d399" : "#a78bfa"}`,
          color: node.id === "start" ? "#065f46" : "#5b21b6",
          fontWeight: 600,
        }
      }
    }
    return node;
  });

  return (
    <div
      className="simulation-flow"
      style={{
        width: "100%",
        height,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1 className="simulation-flow__title">{title}</h1>
      <div style={{ flex: 1, width: "100%" }}>
        <ReactFlow 
          nodes={displayNodes as typeof nodes} 
          edges={edges} 
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          defaultEdgeOptions={defaultEdgeOptions}
        >
          <Background 
            variant={BackgroundVariant.Dots}
            gap={14}
            size={1.25}
            color="#bae6fd"
            bgColor="#f8fafc"
          />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
