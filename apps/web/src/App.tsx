import {
  AlertTriangle,
  BarChart3,
  Droplets,
  Gauge,
  LineChart,
  MapPinned,
  Waves,
  Repeat,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import "./App.css";

const citySystems = [
  {
    city: "Tunja",
    source: "Embalse La Copa",
    operator: "CORPOBOYACA / Veolia Aguas de Tunja",
    demand: "148 L/hab/dia",
    growth: "1.4% anual",
  },
  {
    city: "Duitama",
    source: "Embalse La Playa",
    operator: "CORPOBOYACA / Empoduitama S.A.",
    demand: "132 L/hab/dia",
    growth: "1.1% anual",
  },
  {
    city: "Sogamoso",
    source: "Rio Chicamocha y captaciones asociadas",
    operator: "CORPOBOYACA / Coservicios S.A.",
    demand: "140 L/hab/dia",
    growth: "0.9% anual",
  },
] as const;

const keySignals = [
  "Reduccion de precipitaciones entre 30% y 60% durante eventos intensos de El Nino.",
  "Punto de no retorno definido cuando las reservas caen por debajo del 15% por dos meses consecutivos.",
  "Recarga menor al 20% de la media como condicion critica de colapso.",
  "Eficiencia media de distribucion del 62%, con perdidas del 38% en red.",
] as const;

const modelStructure = [
  {
    category: "Niveles (Stocks)",
    items: [
      "Volumen almacenado en embalses (m³)",
      "Población (número de habitantes)",
      "Nivel del acuífero (m)",
      "Cobertura de páramo (ha)",
    ],
  },
  {
    category: "Flujos (Tasas)",
    items: [
      "Caudal de entrada (precipitación y escorrentía)",
      "Extracción total (doméstica, agrícola, industrial)",
      "Tasa de evaporación (f(temperatura))",
      "Tasa de filtración",
    ],
  },
  {
    category: "Auxiliares / Exógenas",
    items: [
      "Índice ONI (Oceanic Niño Index)",
      "Demanda per cápita (L/hab/día)",
      "Factor de cobertura de páramo",
      "Factor de racionamiento",
    ],
  },
] as const;

const scenarios = [
  {
    name: "Linea base",
    detail: "Serie historica 2000-2023 para calibrar y validar el modelo.",
  },
  {
    name: "El Nino moderado recurrente",
    detail:
      "ONI +1.0 a +1.5 durante 8-12 meses cada 5 anos, con PNR estimado entre 2030 y 2035.",
  },
  {
    name: "El Nino extraordinario prolongado",
    detail:
      "ONI +2.0 a +3.0 durante 18-24 meses continuos, con colapso acelerado antes de 2030.",
  },
] as const;

const loops = [
  {
    name: "Espiral de Escasez (R1)",
    type: "Refuerzo (+)" as const,
    kind: "reinforcing" as const,
    detail:
      "Descenso de reservas → Aumento de extracción de acuíferos → Menor recarga → Mayor descenso. Principal mecanismo de colapso abrupto.",
  },
  {
    name: "Degradación del Páramo (R2)",
    type: "Refuerzo (+)" as const,
    kind: "reinforcing" as const,
    detail:
      "Estrés hídrico → Muerte de vegetación → Menor retención de agua → Menor escorrentía. Daño estructural irreversible a largo plazo.",
  },
  {
    name: "Regulación por Demanda (B1)",
    type: "Balance (-)" as const,
    kind: "balancing" as const,
    detail:
      "Descenso de reservas → Activación de racionamiento → Reducción del consumo. Mecanismo limitado por la demanda mínima vital.",
  },
  {
    name: "Recuperación Natural (B2)",
    type: "Balance (-)" as const,
    kind: "balancing" as const,
    detail:
      "Descenso de reservas → Lluvias post-Niño → Aumento de reservas. Eficaz solo cuando cesa el evento climático.",
  },
] as const;

function App() {
  return (
    <main className="landing-shell">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-7 px-6 py-12">
        {/* Hero */}
        <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.7fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <div>
              <Badge
                variant="outline"
                className="mb-4 border-primary/30 text-primary"
              >
                Proyecto de simulación hídrica regional
              </Badge>
              <h1 className="text-[clamp(2.2rem,4.5vw,4.2rem)] leading-[1.05] -tracking-[0.03em] text-foreground">
                Colapso hídrico regional en Boyacá bajo estrés extremo de El
                Niño
              </h1>
              <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted-foreground">
                Modelo de Dinámica de Sistemas (Forrester) diseñado para
                anticipar el punto de no retorno hídrico en el corredor
                urbano-industrial de Boyacá bajo escenarios de sequía extrema
                inducida por el Fenómeno de El Niño.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-0 bg-foreground text-primary-foreground shadow-lg">
                <CardContent className="p-5">
                  <div className="text-2xl font-bold">3 ciudades</div>
                  <p className="mt-1 text-sm text-accent/85">
                    corredor urbano-industrial analizado
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-foreground text-primary-foreground shadow-lg">
                <CardContent className="p-5">
                  <div className="text-2xl font-bold">2000-2023</div>
                  <p className="mt-1 text-sm text-accent/85">
                    calibración histórica del sistema
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-foreground text-primary-foreground shadow-lg">
                <CardContent className="p-5">
                  <div className="text-2xl font-bold">15%</div>
                  <p className="mt-1 text-sm text-accent/85">
                    umbral de no retorno definido en el documento
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-0 bg-foreground text-primary-foreground shadow-lg">
            <CardContent className="flex flex-col gap-4 p-7">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle size={20} />
                <span>Pregunta de investigación</span>
              </div>
              <p className="leading-relaxed text-accent/85">
                ¿Cuál es el punto de no retorno hídrico para Tunja, Duitama y
                Sogamoso bajo escenarios de sequía extrema inducida por El Niño,
                y qué políticas pueden retrasarlo o evitarlo?
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Info Cards */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Droplets size={18} className="text-primary" />
                <CardTitle>Contexto y Vulnerabilidad</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                El sistema regional opera con retroalimentaciones no lineales
                entre variables climáticas, de demanda y gestión. Depende de
                embalses y páramos frágiles, haciendo difícil anticipar el
                momento exacto de un umbral irreversible solo con análisis
                estadísticos.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gauge size={18} className="text-primary" />
                <CardTitle>Hipótesis del Sistema</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                Se plantea que el sistema exhibe un colapso suave seguido de un
                colapso abrupto cuando las reservas bajan del 15%. Esto activa
                retroalimentaciones positivas (sobrextracción de acuíferos,
                deterioro del páramo) que impiden la recuperación natural.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LineChart size={18} className="text-primary" />
                <CardTitle>¿Por qué Simulación?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                Permite manejar la complejidad dinámica, la irreversibilidad de
                umbrales críticos, y probar escenarios de gestión (políticas) a
                lo largo de décadas sin arriesgar el sistema real en un
                experimento imposible.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* City Systems */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <MapPinned size={18} className="text-primary" />
            <div>
              <Badge variant="secondary" className="mb-1">
                Subsistemas urbanos
              </Badge>
              <h2 className="text-xl font-medium text-foreground">
                Alcance geográfico del modelo
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {citySystems.map((system) => (
              <Card key={system.city}>
                <CardHeader>
                  <CardTitle>{system.city}</CardTitle>
                  <p className="text-sm font-semibold text-primary">
                    {system.source}
                  </p>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-3">
                    <div>
                      <dt className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Operador
                      </dt>
                      <dd className="text-sm text-muted-foreground">
                        {system.operator}
                      </dd>
                    </div>
                    <div>
                      <dt className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Demanda media
                      </dt>
                      <dd className="text-sm text-muted-foreground">
                        {system.demand}
                      </dd>
                    </div>
                    <div>
                      <dt className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Crecimiento
                      </dt>
                      <dd className="text-sm text-muted-foreground">
                        {system.growth}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Split: Forrester + Signals */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                <CardTitle>Estructura Forrester</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5">
                {modelStructure.map((group) => (
                  <div key={group.category}>
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-secondary">
                      {group.category}
                    </h3>
                    <ul className="grid gap-2 text-sm text-muted-foreground">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-primary" />
                <CardTitle>Señales críticas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 text-sm text-muted-foreground">
                {keySignals.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Scenarios */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <Waves size={18} className="text-primary" />
            <div>
              <Badge variant="secondary" className="mb-1">
                Escenarios de simulación
              </Badge>
              <h2 className="text-xl font-medium text-foreground">
                Cómo se estresa el sistema
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {scenarios.map((scenario) => (
              <Card key={scenario.name}>
                <CardHeader>
                  <CardTitle>{scenario.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-muted-foreground">
                    {scenario.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Feedback Loops */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <Repeat size={18} className="text-primary" />
            <div>
              <Badge variant="secondary" className="mb-1">
                Estructura Causal
              </Badge>
              <h2 className="text-xl font-medium text-foreground">
                Lazos de Retroalimentación del Sistema
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {loops.map((loop) => (
              <Card
                key={loop.name}
                className={
                  loop.kind === "reinforcing"
                    ? "border-t-4 border-t-destructive"
                    : "border-t-4 border-t-chart-3"
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{loop.name}</CardTitle>
                    <Badge
                      variant={
                        loop.kind === "reinforcing"
                          ? "destructive"
                          : "secondary"
                      }
                      className="shrink-0"
                    >
                      {loop.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-muted-foreground">
                    {loop.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Footer */}
        <Card>
          <CardHeader>
            <CardTitle>Objetivo de la simulación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-muted-foreground">
              Determinar el momento exacto y las condiciones bajo las cuales el
              sistema hídrico de Boyacá cruza un umbral irreversible,
              configurando un colapso. Evaluando su resiliencia bajo el Índice
              ONI.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default App;
