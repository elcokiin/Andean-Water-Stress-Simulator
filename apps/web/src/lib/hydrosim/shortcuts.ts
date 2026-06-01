export const shortcutGroups = [
  {
    label: "Simulacion",
    shortcuts: [
      ["Space", "Inicia o pausa la simulacion"],
      ["ArrowRight", "Avanza un paso temporal"],
      ["ArrowLeft", "Retrocede un paso temporal"],
      ["R", "Reinicia al escenario base"],
      ["C", "Abre o cierra la configuracion"],
      ["M", "Minimiza o restaura el panel de control"],
      ["H", "Muestra u oculta los badges de atajos"],
      ["D", "Alterna el tema claro u oscuro"],
      ["Escape", "Cierra la configuracion"],
    ],
  },
  {
    label: "Dialogo",
    shortcuts: [
      ["Shift+/", "Abre la referencia de atajos"],
      ["Mod+1", "Abre Escenarios"],
      ["Mod+2", "Abre Clima y Entorno"],
      ["Mod+3", "Abre Demanda Poblacional"],
      ["Mod+4", "Abre Infraestructura"],
      ["Mod+5", "Abre Atajos"],
      ["Mod+E", "Expande o restaura el dialogo"],
      ["Mod+Enter", "Guarda y cierra la base"],
    ],
  },
] as const;
