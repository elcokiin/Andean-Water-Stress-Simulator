import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";

export default defineConfig({
  integrations: [
    starlight({
      title: "Proyecto Final Docs",
      description:
        "Documentacion del modelo de colapso hidrico regional y sus diagramas de simulacion.",
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "Inicio",
          items: [
            { label: "Overview", slug: "" },
            { label: "Getting started", slug: "getting-started" },
          ],
        },
        {
          label: "Investigación",
          items: [
            { label: "Simulación Hídrica", slug: "simulacion-hidrica" },
            { label: "Metodología e Hipótesis", slug: "metodologia-hipotesis" },
          ],
        },
        {
          label: "Diagramas",
          items: [
            { label: "Resumen", slug: "diagrams" },
            { label: "Diagrama principal", slug: "diagrams/main-flow" },
            { label: "Impacto climatico", slug: "diagrams/climate-impact" },
            { label: "Gestion de demanda", slug: "diagrams/demand-management" },
            {
              label: "Punto de no retorno",
              slug: "diagrams/point-of-no-return",
            },
          ],
        },
      ],
    }),
    mdx(),
    react(),
  ],
});
