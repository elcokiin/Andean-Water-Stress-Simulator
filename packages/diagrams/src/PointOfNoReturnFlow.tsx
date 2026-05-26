import { useCallback, type CSSProperties, type ReactNode } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";
import type { Connection, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type DiagramProps = {
  height?: CSSProperties["height"];
  title?: string;
};

const flow = {
  forward: "#0ea5e9",
  branchYes: "#ef4444",
  branchNo: "#22c55e",
  alert: "#dc2626",
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
  background: "#eff6ff",
  border: "2px solid #93c5fd",
  color: "#1e3a8a",
  borderRadius: 8,
  padding: 10,
  fontSize: "12px",
  width: 180,
  textAlign: "center" as const,
};

type NodeData = { label: ReactNode };
const initialNodes = [
  {
    id: "start",
    data: { label: "Inicio PNR" },
    position: { x: 340, y: 50 },
    style: {
      ...baseNodeStyle,
      borderRadius: "50%",
      width: 120,
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  {
    id: "input_data",
    data: { label: "Leer Volumen Actual (%) y Caudal de Entrada" },
    position: { x: 280, y: 150 },
    style: { ...baseNodeStyle, width: 260 },
  },
  {
    id: "decision_vol",
    data: { label: "¿El Volumen Actual es < 15%?" },
    position: { x: 300, y: 280 },
    style: {
      ...baseNodeStyle,
      width: 200,
      background: "#fef3c7",
      borderColor: "#fcd34d",
    },
  },
  {
    id: "reset_counter",
    data: { label: "Contador_Crisis = 0" },
    position: { x: 100, y: 450 },
    style: {
      ...baseNodeStyle,
      background: "#f0fdf4",
      borderColor: "#86efac",
      color: "#14532d",
    },
  },
  {
    id: "decision_caudal",
    data: { label: "¿El Caudal de Entrada es < 20% del promedio?" },
    position: { x: 500, y: 430 },
    style: {
      ...baseNodeStyle,
      width: 220,
      background: "#fef3c7",
      borderColor: "#fcd34d",
    },
  },
  {
    id: "add_time",
    data: { label: "Contador_Crisis = Contador_Crisis + 1" },
    position: { x: 500, y: 620 },
    style: {
      ...baseNodeStyle,
      background: "#fff7ed",
      borderColor: "#fdba74",
      color: "#9a3412",
    },
  },
  {
    id: "decision_counter",
    data: { label: "¿Contador_Crisis >= 60 días?" },
    position: { x: 520, y: 770 },
    style: {
      ...baseNodeStyle,
      width: 200,
      background: "#fef3c7",
      borderColor: "#fcd34d",
    },
  },
  {
    id: "alert_output",
    data: { label: "¡ALERTA DE COLAPSO HÍDRICO!" },
    position: { x: 750, y: 970 },
    style: {
      ...baseNodeStyle,
      width: 240,
      background: "#fef2f2",
      borderColor: "#fca5a5",
      color: "#7f1d1d",
    },
  },
  {
    id: "degradation",
    data: { label: "Activar Lazo R1: Degradación Severa de Páramo" },
    position: { x: 750, y: 1120 },
    style: {
      ...baseNodeStyle,
      width: 240,
      background: "#7f1d1d",
      borderColor: "#991b1b",
      color: "#ffffff",
    },
  },
  {
    id: "end",
    data: { label: "Fin PNR" },
    position: { x: 340, y: 1300 },
    style: {
      ...baseNodeStyle,
      borderRadius: "50%",
      width: 120,
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "start", target: "input_data", ...forwardEdge },
  { id: "e2", source: "input_data", target: "decision_vol", ...forwardEdge },
  {
    id: "e3",
    source: "decision_vol",
    target: "reset_counter",
    label: "No",
    style: { stroke: flow.branchNo, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.branchNo),
    ...edgeLabel,
  },
  {
    id: "e4",
    source: "decision_vol",
    target: "decision_caudal",
    label: "Sí",
    style: { stroke: flow.branchYes, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.branchYes),
    ...edgeLabel,
  },
  {
    id: "e5",
    source: "decision_caudal",
    target: "reset_counter",
    label: "No",
    style: { stroke: flow.branchNo, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.branchNo),
    ...edgeLabel,
  },
  {
    id: "e6",
    source: "decision_caudal",
    target: "add_time",
    label: "Sí",
    style: { stroke: flow.branchYes, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.branchYes),
    ...edgeLabel,
  },
  {
    id: "e7",
    source: "add_time",
    target: "decision_counter",
    ...forwardEdge,
  },
  {
    id: "e8",
    source: "decision_counter",
    target: "end",
    label: "No",
    style: { stroke: flow.branchNo, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.branchNo),
    ...edgeLabel,
  },
  {
    id: "e9",
    source: "decision_counter",
    target: "alert_output",
    label: "Sí",
    style: { stroke: flow.alert, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.alert),
    ...edgeLabel,
  },
  { id: "e10", source: "alert_output", target: "degradation", ...forwardEdge },
  { id: "e11", source: "reset_counter", target: "end", ...forwardEdge },
];

const defaultEdgeOptions = {
  style: { stroke: flow.forward, strokeWidth: flow.strokeWidth },
  markerEnd: marker(flow.forward),
};

export default function PointOfNoReturnFlow({
  height = "calc(100vh - 8rem)",
  title = "Subproceso Punto de No Retorno",
}: DiagramProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const displayNodes = nodes.map((node) => {
    if (!node.data) return node;
    
    if (node.id.startsWith("decision")) {
      return {
        ...node,
        data: {
          ...node.data,
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
                {(node.data as NodeData).label}
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
        },
      };
    }
    if (node.id === "input_data") {
      return {
        ...node,
        data: {
          ...node.data,
          label: (
            <div
              style={{
                transform: "skew(-10deg)",
                background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                border: "2px solid #fb923c",
                color: "#9a3412",
                padding: "10px",
                borderRadius: 8,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ transform: "skew(10deg)" }}>{(node.data as NodeData).label}</div>
            </div>
          ),
        },
        style: {
          ...node.style,
          background: "transparent",
          border: "none",
          padding: 0,
        },
      };
    }
    if (node.id === "alert_output") {
      return {
        ...node,
        data: {
          ...node.data,
          label: (
            <div
              style={{
                transform: "skew(-10deg)",
                background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                border: "2px solid #ef4444",
                color: "#991b1b",
                padding: "10px",
                borderRadius: 8,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              <div style={{ transform: "skew(10deg)" }}>{(node.data as NodeData).label}</div>
            </div>
          ),
        },
        style: {
          ...node.style,
          background: "transparent",
          border: "none",
          padding: 0,
        },
      };
    }
    if (node.id === "start" || node.id === "end") {
      return {
        ...node,
        style: {
          ...node.style,
          background:
            node.id === "start"
              ? "linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)"
              : "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)",
          border: `2px solid ${node.id === "start" ? "#34d399" : "#a78bfa"}`,
          color: node.id === "start" ? "#065f46" : "#5b21b6",
          fontWeight: 600,
        },
      };
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
