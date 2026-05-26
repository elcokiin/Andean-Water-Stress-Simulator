import { useCallback, type CSSProperties, type ReactNode } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import type { Connection, Edge, Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./SimulationFlow.css";

type DiagramProps = {
  height?: CSSProperties["height"];
  title?: string;
};

const flow = {
  forward: "#0ea5e9",
  branchYes: "#22c55e",
  loop: "#f59e0b",
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

function nodeLabel(node: Node): ReactNode {
  return (node.data as { label: ReactNode }).label;
}

const subprocessNodeStyle = {
  padding: "10px",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Inicio de Simulación" },
    position: { x: 250, y: 0 },
    style: {
      borderRadius: 50,
      width: 160,
      background: "linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)",
      border: "2px solid #34d399",
      color: "#065f46",
      fontWeight: 600,
    },
  },
  {
    id: "2",
    data: {
      label: (
        <>
          <strong>Condiciones Iniciales 2026</strong>
          <br />
          (Vol = X, Pob = Y, T = 0)
        </>
      ),
    },
    position: { x: 250, y: 130 },
    style: {
      background: "transparent",
      border: "none",
      boxShadow: "none",
      padding: 0,
      width: 250,
    },
  },
  {
    id: "3",
    data: { label: "Ejecutar Subproceso de Impacto Climático" },
    position: { x: 250, y: 270 },
    style: {
      width: 250,
      background: "#f0f9ff",
      border: "2px solid #7dd3fc",
      color: "#0c4a6e",
    },
  },
  {
    id: "4",
    data: { label: "Ejecutar Subproceso de Gestión de Demanda" },
    position: { x: 250, y: 400 },
    style: {
      width: 250,
      background: "#f0f9ff",
      border: "2px solid #7dd3fc",
      color: "#0c4a6e",
    },
  },
  {
    id: "5",
    data: { label: "Ejecutar Subproceso Punto de No Retorno" },
    position: { x: 250, y: 530 },
    style: {
      width: 250,
      background: "#eff6ff",
      border: "2px solid #93c5fd",
      color: "#1e3a8a",
    },
  },
  {
    id: "6",
    data: {
      label: (
        <>
          <strong>Calcular nuevo volumen:</strong>
          <br />
          Vol(t) = Vol(t-dt) + (Entrada - Evap - Extracción) * dt
        </>
      ),
    },
    position: { x: 250, y: 670 },
    style: {
      width: 350,
      background: "#ecfeff",
      border: "2px solid #22d3ee",
      color: "#164e63",
    },
  },
  {
    id: "7",
    data: { label: "Actualizar Población y Factor de Cobertura de Páramo" },
    position: { x: 250, y: 810 },
    style: {
      width: 350,
      background: "#ecfeff",
      border: "2px solid #22d3ee",
      color: "#164e63",
    },
  },
  {
    id: "8",
    data: { label: "¿T == 2050?" },
    position: { x: 250, y: 970 },
    style: {
      width: 120,
      height: 120,
      background: "transparent",
      border: "none",
      boxShadow: "none",
      padding: 0,
    },
  },
  {
    id: "9",
    data: {
      label: (
        <>
          <strong>Avanzar tiempo</strong>
          <br />
          (T = T + 1)
        </>
      ),
    },
    position: { x: 0, y: 620 },
    style: {
      background: "#fdf4ff",
      border: "2px solid #e879f9",
      color: "#86198f",
    },
  },
  {
    id: "10",
    data: { label: "Generar Gráficas y Reportes" },
    position: { x: 250, y: 1170 },
    style: {
      background: "transparent",
      border: "none",
      boxShadow: "none",
      padding: 0,
      width: 250,
    },
  },
  {
    id: "11",
    type: "output",
    data: { label: "Fin de Simulación" },
    position: { x: 250, y: 1320 },
    style: {
      borderRadius: 50,
      width: 170,
      background: "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)",
      border: "2px solid #a78bfa",
      color: "#5b21b6",
      fontWeight: 600,
    },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", ...forwardEdge },
  { id: "e2-3", source: "2", target: "3", ...forwardEdge },
  { id: "e3-4", source: "3", target: "4", ...forwardEdge },
  { id: "e4-5", source: "4", target: "5", ...forwardEdge },
  { id: "e5-6", source: "5", target: "6", ...forwardEdge },
  { id: "e6-7", source: "6", target: "7", ...forwardEdge },
  { id: "e7-8", source: "7", target: "8", ...forwardEdge },
  {
    id: "e8-10",
    source: "8",
    target: "10",
    label: "Sí",
    style: { stroke: flow.branchYes, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.branchYes),
    ...edgeLabel,
  },
  {
    id: "e8-9",
    source: "8",
    target: "9",
    label: "No",
    type: "step",
    style: { stroke: flow.loop, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.loop),
    ...edgeLabel,
  },
  {
    id: "e9-3",
    source: "9",
    target: "3",
    type: "step",
    style: { stroke: flow.loop, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.loop),
  },
  {
    id: "e10-11",
    source: "10",
    target: "11",
    style: { stroke: flow.toEnd, strokeWidth: flow.strokeWidth },
    markerEnd: marker(flow.toEnd),
  },
];

const defaultEdgeOptions = {
  style: { stroke: flow.forward, strokeWidth: flow.strokeWidth },
  markerEnd: marker(flow.forward),
};

function minimapNodeColor(node: Node) {
  if (node.type === "input") return "#34d399";
  if (node.type === "output") return "#a78bfa";
  if (node.id === "8") return "#fbbf24";
  if (node.id === "9") return "#e879f9";
  if (node.id === "2" || node.id === "10") return "#fb923c";
  return "#38bdf8";
}

export default function SimulationFlow({
  height = "calc(100vh - 12rem)",
  title = "Diagrama de Flujo Principal (Bucle de Simulación de Tiempo)",
}: DiagramProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const displayNodes = nodes.map((node) => {
    if (node.id === "8") {
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
                {nodeLabel(node)}
              </div>
            </div>
          ),
        },
      };
    }
    if (node.id === "2" || node.id === "10") {
      return {
        ...node,
        data: {
          label: (
            <div
              style={{
                transform: "skew(-10deg)",
                background:
                  node.id === "10"
                    ? "linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)"
                    : "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                border: `2px solid ${node.id === "10" ? "#eab308" : "#fb923c"}`,
                color: node.id === "10" ? "#713f12" : "#9a3412",
                padding: "10px",
                borderRadius: 8,
              }}
            >
              <div style={{ transform: "skew(10deg)" }}>{nodeLabel(node)}</div>
            </div>
          ),
        },
      };
    }
    if (node.id === "3" || node.id === "4" || node.id === "5") {
      return {
        ...node,
        data: {
          label: <div style={subprocessNodeStyle}>{nodeLabel(node)}</div>,
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
      <div className="simulation-flow__panel">
        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-right"
          defaultEdgeOptions={defaultEdgeOptions}
        >
          <Controls />
          <MiniMap
            pannable
            zoomable
            nodeColor={minimapNodeColor}
            nodeStrokeWidth={2}
            maskColor="rgb(14 165 233 / 12%)"
            style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <Background
            variant={BackgroundVariant.Dots}
            gap={14}
            size={1.25}
            color="#bae6fd"
            bgColor="#f8fafc"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
