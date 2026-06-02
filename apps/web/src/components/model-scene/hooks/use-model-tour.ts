import { useCallback, useRef } from "react";
import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";

import { useSimulationStore } from "@/lib/stores/simulation-store";

const TOUR_STEPS: DriveStep[] = [
  {
    element: '[data-tour="title-bar"]',
    popover: {
      title: "Modelo hídrico regional",
      description:
        "Esta barra identifica la ciudad activa y concentra la navegación global del modelo Forrester sobre reservas de agua en Boyacá.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="city-selector"]',
    popover: {
      title: "Selecciona la ciudad",
      description:
        "Cambia entre Tunja, Duitama y Sogamoso. Cada ciudad carga su fuente hídrica, población inicial y escena 3D propia.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="model-viewport"]',
    popover: {
      title: "Escena del sistema",
      description:
        "La visualización 3D traduce el estado del embalse, lluvia, niebla y nivel del agua para leer el comportamiento del sistema sin abrir tablas.",
      side: "over",
      align: "center",
    },
  },
  {
    element: '[data-tour="controls-panel"]',
    popover: {
      title: "Panel de control",
      description:
        "Aquí se opera la corrida: escenario, mes actual, indicadores críticos, reproducción, reinicio y acceso a la configuración fina.",
      side: "right",
      align: "center",
    },
  },
  {
    element: '[data-tour="scenario-selector"]',
    popover: {
      title: "Escenarios ONI",
      description:
        "Compara línea base, El Niño moderado y El Niño extremo. El valor ONI cambia la precipitación efectiva y acelera o retrasa el estrés hídrico.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="reservoir-status"]',
    popover: {
      title: "Reserva y umbral PNR",
      description:
        "La barra muestra el porcentaje del embalse. Cuando cae por debajo del 15% durante el periodo crítico, el modelo marca el punto de no retorno.",
      side: "right",
      align: "center",
    },
  },
  {
    element: '[data-tour="flow-metrics"]',
    popover: {
      title: "Lectura de flujos y stocks",
      description:
        "Entrada, extracción, cobertura de páramo y acuífero resumen la estructura stock-flujo: recarga, demanda, amortiguación ecológica y respaldo subterráneo.",
      side: "right",
      align: "center",
    },
  },
  {
    element: '[data-tour="playback-controls"]',
    popover: {
      title: "Ejecuta la simulación",
      description:
        "Usa Simular para avanzar mes a mes y observa cómo cambian reserva, recuperación natural, degradación del páramo y riesgo de colapso.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="charts-panel"]',
    popover: {
      title: "Trayectorias",
      description:
        "La gráfica permite seguir la reserva en el tiempo. La banda roja representa el PNR y la verde la meta operativa de estabilidad.",
      side: "left",
      align: "center",
    },
  },
  {
    element: '[data-tour="help-tour-button"]',
    popover: {
      title: "Repite esta guía",
      description:
        "Este botón de signo de interrogación inicia el tour. También puedes abrirlo con la tecla H desde la vista del modelo.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="config-button"]',
    popover: {
      title: "Configuración del modelo",
      description:
        "El engranaje abre el diálogo donde vive la mayor parte del modelo editable: escenarios, clima, demanda, infraestructura y atajos.",
      side: "right",
      align: "center",
      onNextClick: (_, __, { driver: tourDriver }) => {
        useSimulationStore.getState().setConfigOpen(true);
        window.requestAnimationFrame(() => tourDriver.moveNext());
      },
    },
  },
  {
    element: '[data-tour="config-dialog"]',
    popover: {
      title: "Centro de parametrización",
      description:
        "Este diálogo es el laboratorio principal: cada cambio se previsualiza contra la dinámica stock-flujo antes de guardar o descartar.",
      side: "over",
      align: "center",
    },
    onHighlightStarted: () => {
      useSimulationStore.getState().setConfigOpen(true);
    },
  },
  {
    element: '[data-tour="config-tabs"]',
    popover: {
      title: "Pestañas del modelo",
      description:
        "Usa la navegación lateral para moverte entre escenarios rápidos, clima y entorno, demanda poblacional, infraestructura y la referencia de atajos.",
      side: "right",
      align: "center",
    },
  },
  {
    element: '[data-tour="config-content"]',
    popover: {
      title: "Parámetros editables",
      description:
        "Aquí se ajustan las variables que más cambian la simulación: intensidad ONI, lluvia, consumo, eficiencia, racionamiento, visibilidad del agua y niebla.",
      side: "left",
      align: "center",
    },
  },
  {
    element: '[data-tour="config-footer"]',
    popover: {
      title: "Experimenta sin perder control",
      description:
        "Descartar revierte la prueba actual. Guardar y Simular confirma los parámetros para seguir analizando políticas y riesgo de colapso.",
      side: "top",
      align: "center",
    },
  },
  {
    popover: {
      title: "Listo para explorar",
      description:
        "Empieza por cambiar un escenario, abre configuración para modificar supuestos y observa en la escena y la gráfica cuándo aparece el PNR.",
      side: "over",
      align: "center",
    },
  },
];

export function useModelTour() {
  const driverRef = useRef<Driver | null>(null);

  return useCallback(() => {
    const store = useSimulationStore.getState();
    store.setConfigOpen(false);
    store.setChartsPanelOpen(true);
    if (store.controlsPanelMinimized) {
      store.toggleControlsPanelMinimized();
    }

    window.requestAnimationFrame(() => {
      driverRef.current?.destroy();

      const modelTour = driver({
        steps: TOUR_STEPS,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        allowKeyboardControl: true,
        overlayColor: "rgb(7, 20, 32)",
        overlayOpacity: 0.58,
        stagePadding: 8,
        stageRadius: 10,
        popoverClass: "hydrosim-driver-popover",
        showButtons: ["previous", "next", "close"],
        showProgress: true,
        progressText: "{{current}} de {{total}}",
        nextBtnText: "Siguiente",
        prevBtnText: "Anterior",
        doneBtnText: "Finalizar",
        onDestroyed: () => {
          useSimulationStore.getState().setConfigOpen(false);
        },
      });

      driverRef.current = modelTour;
      modelTour.drive();
    });
  }, []);
}
