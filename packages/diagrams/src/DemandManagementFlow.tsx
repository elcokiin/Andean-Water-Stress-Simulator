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
  branchYes: "#ef4444", // Redish for rationing
  loop: "#22c55e", // Greenish for normal
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
    data: { label: "Inicio Demanda" },
    position: { x: 340, y: 50 },
    style: { ...baseNodeStyle, borderRadius: "50%", width: 120, height: 60, display: "flex", alignItems: "center", justifyContent: "center" },
  },
  {
    id: "input_data",
    data: { label: "Leer Volumen Actual y Población" },
    position: { x: 280, y: 200 },
    style: { ...baseNodeStyle, width: 240 },
  },
  {
    id: "calc_level",
    data: { label: "Calcular Nivel del Embalse (%) = (Vol / Capacidad) * 100" },
    position: { x: 280, y: 350 },
    style: { ...baseNodeStyle, width: 240 },
  },
  {
    id: "decision_15",
    data: { label: "¿El Nivel del Embalse es < 15%?" },
    position: { x: 300, y: 500 },
    style: { ...baseNodeStyle, width: 200, background: "#fef3c7", borderColor: "#fcd34d" },
  },
  {
    id: "ration_extreme",
    data: { label: "Racionamiento Extremo: Factor = 0.090" },
    position: { x: 30, y: 650 },
    style: { ...baseNodeStyle, background: "#fef2f2", borderColor: "#fca5a5", color: "#7f1d1d" },
  },
  {
    id: "decision_30",
    data: { label: "¿El Nivel del Embalse es < 30%?" },
    position: { x: 500, y: 600 },
    style: { ...baseNodeStyle, width: 200, background: "#fef3c7", borderColor: "#fcd34d" },
  },
  {
    id: "ration_moderate",
    data: { label: "Racionamiento Moderado: Factor = 0.110" },
    position: { x: 340, y: 750 },
    style: { ...baseNodeStyle, background: "#fff7ed", borderColor: "#fdba74", color: "#9a3412" },
  },
  {
    id: "no_normal",
    data: { label: "Estado Normal: Factor = 0.148" },
    position: { x: 670, y: 750 },
    style: { ...baseNodeStyle, background: "#f0fdf4", borderColor: "#86efac", color: "#14532d" },
  },
  {
    id: "calc_extract",
    data: { label: "Calcular Extracción Total = Pob * Tasa * Factor" },
    position: { x: 280, y: 950 },
    style: { ...baseNodeStyle, width: 240 },
  },
  {
    id: "output",
    data: { label: "Retornar Extracción Total" },
    position: { x: 280, y: 1100 },
    style: { ...baseNodeStyle, width: 240 },
  },
  {
    id: "end",
    data: { label: "Fin Demanda" },
    position: { x: 340, y: 1250 },
    style: { ...baseNodeStyle, borderRadius: "50%", width: 120, height: 60, display: "flex", alignItems: "center", justifyContent: "center" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "start", target: "input_data", ...forwardEdge },
  { id: "e2", source: "input_data", target: "calc_level", ...forwardEdge },
  { id: "e3", source: "calc_level", target: "decision_15", ...forwardEdge },
  { 
    id: "e4", 
    source: "decision_15", 
    target: "ration_extreme", 
    label: "Sí",
    style: { stroke: flow.branchYes, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.branchYes),
    ...edgeLabel 
  },
  { 
    id: "e5", 
    source: "decision_15", 
    target: "decision_30", 
    label: "No",
    style: { stroke: flow.forward, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.forward),
    ...edgeLabel 
  },
  { 
    id: "e6", 
    source: "decision_30", 
    target: "ration_moderate", 
    label: "Sí",
    style: { stroke: "#f97316", strokeWidth: flow.strokeWidth },
    markerEnd: marker("#f97316"),
    ...edgeLabel 
  },
  { 
    id: "e7", 
    source: "decision_30", 
    target: "no_normal", 
    label: "No",
    style: { stroke: flow.loop, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.loop),
    ...edgeLabel 
  },
  { id: "e8", source: "ration_extreme", target: "calc_extract", ...forwardEdge },
  { id: "e9", source: "ration_moderate", target: "calc_extract", ...forwardEdge },
  { id: "e10", source: "no_normal", target: "calc_extract", ...forwardEdge },
  { id: "e11", source: "calc_extract", target: "output", ...forwardEdge },
  { id: "e12", source: "output", target: "end", ...forwardEdge },
];

const defaultEdgeOptions = {
  style: { stroke: flow.forward, strokeWidth: flow.strokeWidth },
  markerEnd: marker(flow.forward),
};

export default function DemandManagementFlow({
  height = "calc(100vh - 8rem)",
  title = "Subproceso de Gestión de Demanda",
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
    if (node.id === "input_data" || node.id === "output") {
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
