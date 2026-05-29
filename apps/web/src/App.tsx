import {
  AlertTriangle,
  BarChart3,
  Droplets,
  Gauge,
  LineChart,
  MapPinned,
  Waves,
  Repeat,
  Moon,
  Sun,
  ArrowRight,
  Activity,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import "./App.css";
import { useTheme } from "@/lib/theme-provider";

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
  const { theme, toggle } = useTheme();

  return (
    <div className="landing-shell min-h-screen font-sans selection:bg-primary/30 relative">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">HydroSim</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="hidden text-muted-foreground hover:text-foreground md:flex">
              <a href={`${import.meta.env.VITE_DOCS_URL}/metodologia-hipotesis`} target="_blank" rel="noreferrer">Metodología</a>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden text-muted-foreground hover:text-foreground md:flex">
              <a href={`${import.meta.env.VITE_DOCS_URL}/simulacion-hidrica`} target="_blank" rel="noreferrer">Documentación</a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-16 px-6 py-16 md:py-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center max-w-[800px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge
            variant="outline"
            className="mb-6 border-primary/30 text-primary bg-primary/5 px-4 py-1.5 text-sm font-medium backdrop-blur-sm rounded-full"
          >
            Proyecto de simulación hídrica regional
          </Badge>
          <h1 className="text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold leading-[1.1] tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground/90 to-foreground/50 drop-shadow-sm mb-6 text-balance">
            Colapso hídrico en Boyacá bajo estrés extremo.
          </h1>
          <p className="max-w-[42rem] text-lg md:text-xl leading-relaxed text-muted-foreground font-medium mb-10 text-balance">
            Modelo de Dinámica de Sistemas (Forrester) diseñado para anticipar el punto de no retorno hídrico en el corredor urbano-industrial bajo escenarios del Fenómeno de El Niño.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button size="lg" asChild className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
              <Link to="/model">
                Explorar Modelo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-base font-semibold border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted/50 transition-all">
              <a href={`${import.meta.env.VITE_DOCS_URL}/metodologia-hipotesis`} target="_blank" rel="noreferrer">
                Leer Hipótesis <ChevronRight className="ml-1 h-4 w-4 text-muted-foreground" />
              </a>
            </Button>
          </div>
        </section>

        {/* Highlight Stats (Floating Banner) */}
        <section className="relative z-10 -mt-4 mb-8">
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-xl shadow-black/5 p-2 mx-auto max-w-[1000px]">
            <div className="grid grid-cols-1 divide-y divide-border/50 md:grid-cols-3 md:divide-y-0 md:divide-x">
              <div className="flex flex-col items-center justify-center p-6 text-center transition-colors hover:bg-muted/20 rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
                <div className="text-4xl font-black tracking-tight text-foreground mb-1">3 <span className="text-2xl text-muted-foreground font-semibold">ciudades</span></div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">Corredor analizado</p>
              </div>
              <div className="flex flex-col items-center justify-center p-6 text-center transition-colors hover:bg-muted/20">
                <div className="text-4xl font-black tracking-tight text-foreground mb-1">2000<span className="text-muted-foreground/50">-</span>23</div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">Calibración base</p>
              </div>
              <div className="flex flex-col items-center justify-center p-6 text-center transition-colors hover:bg-muted/20 rounded-b-xl md:rounded-r-xl md:rounded-bl-none">
                <div className="flex items-start">
                  <div className="text-4xl font-black tracking-tight text-destructive">15</div>
                  <span className="text-2xl font-bold text-destructive mt-0.5">%</span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-destructive/80 mt-1">Umbral crítico</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards (Bento) */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Main Question Card - spans 2 columns */}
          <Card className="md:col-span-2 relative overflow-hidden border-border/60 bg-gradient-to-br from-card/80 to-muted/20 shadow-sm transition-all hover:shadow-md hover:border-primary/30 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative flex flex-col h-full justify-center p-8 lg:p-10 gap-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary w-fit border border-primary/10">
                <AlertTriangle size={16} />
                <span>Pregunta de investigación</span>
              </div>
              <h3 className="text-2xl lg:text-3xl leading-snug font-bold text-foreground tracking-tight text-balance">
                ¿Cuál es el punto de no retorno hídrico para Tunja, Duitama y
                Sogamoso bajo escenarios de sequía extrema?
              </h3>
              <p className="text-muted-foreground text-lg font-medium">
                Y más importante aún: ¿qué políticas pueden retrasarlo o evitarlo estructuralmente?
              </p>
            </CardContent>
          </Card>

          {/* Context Card */}
          <Card className="relative overflow-hidden border-border/60 bg-card/60 shadow-sm transition-all hover:shadow-md hover:border-primary/30 group">
            <CardHeader className="pb-2 pt-8 px-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground duration-300">
                <Droplets size={24} />
              </div>
              <CardTitle className="text-xl">Vulnerabilidad</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <p className="leading-relaxed text-muted-foreground">
                El sistema regional opera con retroalimentaciones no lineales
                entre clima y demanda, dependiendo de ecosistemas frágiles.
              </p>
            </CardContent>
          </Card>

          {/* Hypothesis Card */}
          <Card className="relative overflow-hidden border-border/60 bg-card/60 shadow-sm transition-all hover:shadow-md hover:border-primary/30 group">
            <CardHeader className="pb-2 pt-8 px-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground duration-300">
                <Gauge size={24} />
              </div>
              <CardTitle className="text-xl">Hipótesis</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <p className="leading-relaxed text-muted-foreground">
                Un colapso suave precede a un colapso abrupto cuando las reservas bajan del 15%, activando bucles que impiden la recuperación.
              </p>
            </CardContent>
          </Card>

          {/* Why Simulation Card - Spans 2 columns on tablet, 1 on desktop but wider layout */}
          <Card className="md:col-span-2 relative overflow-hidden border-border/60 bg-card/60 shadow-sm transition-all hover:shadow-md hover:border-primary/30 group">
            <CardHeader className="pb-2 pt-8 px-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground duration-300">
                <LineChart size={24} />
              </div>
              <CardTitle className="text-xl">¿Por qué Dinámica de Sistemas?</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <p className="leading-relaxed text-muted-foreground text-lg">
                Permite manejar la complejidad dinámica, la irreversibilidad de
                umbrales críticos, y probar escenarios de gestión (políticas) a
                lo largo de décadas sin arriesgar el sistema real en un
                experimento imposible en la vida real.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-border/40" />

        {/* City Systems */}
        <section>
          <div className="mb-10 flex flex-col items-center text-center">
            <Badge variant="secondary" className="mb-3 bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 transition-colors">
              Subsistemas Urbanos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center justify-center gap-3">
              <MapPinned className="text-primary h-8 w-8" />
              Alcance Geográfico
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {citySystems.map((system) => (
              <Card key={system.city} className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <CardHeader className="pb-4 border-b border-border/30 bg-muted/10">
                  <div className="flex justify-between items-center mb-2">
                    <CardTitle className="text-2xl font-bold">{system.city}</CardTitle>
                    <div className="h-2 w-2 rounded-full bg-primary/60 group-hover:bg-primary transition-colors" />
                  </div>
                  <p className="text-sm font-semibold text-primary/90 flex items-center gap-1.5">
                    <Droplets size={14} />
                    {system.source}
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <dl className="grid gap-5">
                    <div>
                      <dt className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                        Operador Principal
                      </dt>
                      <dd className="text-sm font-medium text-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/30">
                        {system.operator}
                      </dd>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-muted/30 p-3.5 border border-border/30">
                        <dt className="mb-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                          Demanda
                        </dt>
                        <dd className="text-base font-bold text-foreground">
                          {system.demand}
                        </dd>
                      </div>
                      <div className="rounded-xl bg-muted/30 p-3.5 border border-border/30">
                        <dt className="mb-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                          Crecimiento
                        </dt>
                        <dd className="text-base font-bold text-foreground">
                          {system.growth}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="bg-border/40" />

        {/* Split: Forrester + Signals */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
            <CardHeader className="border-b border-border/30 bg-muted/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BarChart3 size={22} />
                </div>
                <div>
                  <CardTitle className="text-xl">Estructura Forrester</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Variables y arquitectura del modelo</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-8">
                {modelStructure.map((group) => (
                  <div key={group.category} className="group">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-secondary flex items-center gap-3">
                      <span className="h-px flex-1 bg-gradient-to-r from-secondary/50 to-transparent"></span>
                      {group.category}
                    </h3>
                    <ul className="grid gap-3 text-sm text-foreground/80">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-center gap-3 bg-muted/20 px-4 py-2.5 rounded-lg border border-border/30 hover:border-primary/20 transition-colors">
                          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5 backdrop-blur-sm shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <CardHeader className="border-b border-destructive/10 bg-destructive/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/20 text-destructive">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <CardTitle className="text-xl text-destructive">Señales críticas</CardTitle>
                  <p className="text-sm text-destructive/70 mt-1">Indicadores de colapso en el sistema</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
              <ul className="grid gap-4 text-sm text-foreground/90">
                {keySignals.map((item) => (
                  <li key={item} className="flex items-start gap-4 rounded-xl bg-background/50 p-4 border border-destructive/10 shadow-sm hover:border-destructive/30 transition-colors">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                      <span className="block h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    </div>
                    <span className="leading-relaxed font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Scenarios */}
        <section className="rounded-3xl bg-muted/20 p-8 md:p-12 border border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="mb-10 flex flex-col items-center text-center max-w-2xl mx-auto">
              <Badge variant="outline" className="mb-4 bg-background/50 backdrop-blur-md border-border text-foreground">
                Escenarios de simulación
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center justify-center gap-3 mb-4">
                <Waves className="text-primary h-8 w-8" />
                Estrés del Sistema
              </h2>
              <p className="text-muted-foreground text-lg">Proyecciones basadas en el Índice Oceánico del Niño (ONI) para evaluar la resiliencia hídrica futura.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {scenarios.map((scenario, i) => (
                <Card key={scenario.name} className="border-border/50 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-transparent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  <CardHeader className="pb-4">
                    <div className="text-5xl font-black text-muted mb-4 opacity-50 group-hover:text-primary/20 transition-colors">0{i + 1}</div>
                    <CardTitle className="text-xl leading-tight font-bold">{scenario.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed text-muted-foreground text-sm font-medium">
                      {scenario.detail}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feedback Loops */}
        <section className="w-[100vw] relative left-1/2 -translate-x-1/2 overflow-hidden py-10 -my-10">
          <div className="mb-10 flex flex-col items-center text-center">
            <Badge variant="secondary" className="mb-3 bg-secondary/20 text-secondary-foreground">
              Dinámica Causal
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center justify-center gap-3">
              <Repeat className="text-primary h-8 w-8" />
              Lazos de Retroalimentación
            </h2>
          </div>
          
          <div className="relative w-full max-w-[100vw] overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_15%,_black_85%,transparent_100%)] flex items-center">
            <div className="flex w-max animate-scroll gap-6 py-4 hover:[animation-play-state:paused]">
              {[...loops, ...loops].map((loop, idx) => (
                <Card
                  key={`${loop.name}-${idx}`}
                  className={`w-[350px] md:w-[450px] shrink-0 overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group ${
                    loop.kind === "reinforcing"
                      ? "hover:border-destructive/40"
                      : "hover:border-chart-3/40"
                  }`}
                >
                  <div className={`h-1.5 w-full ${loop.kind === "reinforcing" ? "bg-destructive/80" : "bg-chart-3/80"}`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-xl font-bold">{loop.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={`shrink-0 font-bold border-2 ${
                          loop.kind === "reinforcing"
                            ? "border-destructive/20 text-destructive bg-destructive/5"
                            : "border-chart-3/20 text-chart-3 bg-chart-3/5"
                        }`}
                      >
                        {loop.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed text-muted-foreground font-medium">
                      {loop.detail}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="relative mt-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background rounded-3xl blur-xl opacity-50" />
          <Card className="relative overflow-hidden border-primary/20 bg-background/80 backdrop-blur-xl text-center shadow-2xl rounded-3xl">
            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 p-32 bg-secondary/5 rounded-full blur-3xl" />
            
            <CardContent className="p-12 md:p-20 flex flex-col items-center gap-6 relative z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30 text-primary-foreground mb-2">
                <MapPinned size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Objetivo de la simulación</h2>
              <p className="max-w-[48rem] text-lg md:text-xl leading-relaxed text-muted-foreground font-medium mb-4">
                Determinar el momento exacto y las condiciones bajo las cuales el
                sistema hídrico de Boyacá cruza un umbral irreversible,
                configurando un colapso. Evaluando su resiliencia bajo el Índice
                ONI.
              </p>
              <Button size="lg" asChild className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all mt-4">
                <Link to="/model">Comenzar Análisis</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
        
        {/* Simple Footer */}
        <footer className="border-t border-border/40 py-8 mt-10 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Simulación Hídrica Regional Boyacá. Modelo Forrester.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
