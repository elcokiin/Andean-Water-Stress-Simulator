export const shortcutGroups = [
  {
    label: "Simulacion",
    shortcuts: [
      ["Espacio", "Inicia o pausa la simulacion"],
      ["Flecha derecha", "Avanza un paso temporal"],
      ["Flecha izquierda", "Retrocede un paso temporal"],
      ["R", "Reinicia al escenario base"],
      ["C", "Abre o cierra la configuracion"],
      ["Esc", "Cierra la configuracion"],
    ],
  },
  {
    label: "Dialogo",
    shortcuts: [
      ["?", "Abre la referencia de atajos"],
      ["Ctrl + 1", "Abre Escenarios"],
      ["Ctrl + 2", "Abre Parametros"],
      ["Ctrl + 3", "Abre Atajos"],
      ["Ctrl + E", "Expande o restaura el dialogo"],
      ["Ctrl + Enter", "Guarda y cierra la base"],
    ],
  },
] as const;
