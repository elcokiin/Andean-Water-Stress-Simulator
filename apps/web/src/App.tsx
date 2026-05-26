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
    type: "Refuerzo (+)",
    detail:
      "Descenso de reservas → Aumento de extracción de acuíferos → Menor recarga → Mayor descenso. Principal mecanismo de colapso abrupto.",
  },
  {
    name: "Degradación del Páramo (R2)",
    type: "Refuerzo (+)",
    detail:
      "Estrés hídrico → Muerte de vegetación → Menor retención de agua → Menor escorrentía. Daño estructural irreversible a largo plazo.",
  },
  {
    name: "Regulación por Demanda (B1)",
    type: "Balance (-)",
    detail:
      "Descenso de reservas → Activación de racionamiento → Reducción del consumo. Mecanismo limitado por la demanda mínima vital.",
  },
  {
    name: "Recuperación Natural (B2)",
    type: "Balance (-)",
    detail:
      "Descenso de reservas → Lluvias post-Niño → Aumento de reservas. Eficaz solo cuando cesa el evento climático.",
  },
] as const;

function App() {
  return (
    <main className="landing-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">
            Proyecto de simulacion hidrica regional
          </span>
          <h1>
            Colapso hidrico regional en Boyaca bajo estres extremo de El Nino
          </h1>
          <p className="hero-lead">
            Modelo de Dinámica de Sistemas (Forrester) diseñado para anticipar
            el punto de no retorno hídrico en el corredor urbano-industrial de
            Boyacá bajo escenarios de sequía extrema inducida por el Fenómeno de
            El Niño.
          </p>

          <div className="hero-metrics">
            <article>
              <strong>3 ciudades</strong>
              <span>corredor urbano-industrial analizado</span>
            </article>
            <article>
              <strong>2000-2023</strong>
              <span>calibracion historica del sistema</span>
            </article>
            <article>
              <strong>15%</strong>
              <span>umbral de no retorno definido en el documento</span>
            </article>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-header">
            <AlertTriangle size={20} />
            <span>Pregunta de investigacion</span>
          </div>
          <p>
            Cual es el punto de no retorno hidrico para Tunja, Duitama y
            Sogamoso bajo escenarios de sequia extrema inducida por El Nino, y
            que politicas pueden retrasarlo o evitarlo.
          </p>
        </div>
      </section>

      <section className="grid-section">
        <article className="info-card accent-card">
          <div className="card-title">
            <Droplets size={18} />
            <h2>Contexto y Vulnerabilidad</h2>
          </div>
          <p>
            El sistema regional opera con retroalimentaciones no lineales entre
            variables climáticas, de demanda y gestión. Depende de embalses y
            páramos frágiles, haciendo difícil anticipar el momento exacto de un
            umbral irreversible solo con análisis estadísticos.
          </p>
        </article>

        <article className="info-card">
          <div className="card-title">
            <Gauge size={18} />
            <h2>Hipótesis del Sistema</h2>
          </div>
          <p>
            Se plantea que el sistema exhibe un colapso suave seguido de un
            colapso abrupto cuando las reservas bajan del 15%. Esto activa
            retroalimentaciones positivas (sobrextracción de acuíferos,
            deterioro del páramo) que impiden la recuperación natural.
          </p>
        </article>

        <article className="info-card">
          <div className="card-title">
            <LineChart size={18} />
            <h2>¿Por qué Simulación?</h2>
          </div>
          <p>
            Permite manejar la complejidad dinámica, la irreversibilidad de
            umbrales críticos, y probar escenarios de gestión (políticas) a lo
            largo de décadas sin arriesgar el sistema real en un experimento
            imposible.
          </p>
        </article>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <MapPinned size={18} />
          <div>
            <span>Subsistemas urbanos</span>
            <h2>Alcance geografico del modelo</h2>
          </div>
        </div>

        <div className="city-grid">
          {citySystems.map((system) => (
            <article className="city-card" key={system.city}>
              <h3>{system.city}</h3>
              <p className="city-source">{system.source}</p>
              <dl>
                <div>
                  <dt>Operador</dt>
                  <dd>{system.operator}</dd>
                </div>
                <div>
                  <dt>Demanda media</dt>
                  <dd>{system.demand}</dd>
                </div>
                <div>
                  <dt>Crecimiento</dt>
                  <dd>{system.growth}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section">
        <article className="info-card tall-card">
          <div className="card-title">
            <BarChart3 size={18} />
            <h2>Estructura Forrester</h2>
          </div>
          <div className="structure-list">
            {modelStructure.map((group) => (
              <div key={group.category} className="structure-group">
                <h3>{group.category}</h3>
                <ul className="bullet-list">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>

        <article className="info-card tall-card">
          <div className="card-title">
            <AlertTriangle size={18} />
            <h2>Senales criticas</h2>
          </div>
          <ul className="bullet-list">
            {keySignals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <Waves size={18} />
          <div>
            <span>Escenarios de simulacion</span>
            <h2>Como se estresa el sistema</h2>
          </div>
        </div>

        <div className="scenario-list">
          {scenarios.map((scenario) => (
            <article className="scenario-card" key={scenario.name}>
              <h3>{scenario.name}</h3>
              <p>{scenario.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block loops-section">
        <div className="section-heading">
          <Repeat size={18} />
          <div>
            <span>Estructura Causal</span>
            <h2>Lazos de Retroalimentación del Sistema</h2>
          </div>
        </div>

        <div className="scenario-list">
          {loops.map((loop) => (
            <article
              className={`scenario-card ${loop.type.includes("+") ? "danger-card" : "safe-card"}`}
              key={loop.name}
            >
              <div className="loop-header">
                <h3>{loop.name}</h3>
                <span className="loop-type">{loop.type}</span>
              </div>
              <p>{loop.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="footer-panel">
        <article className="info-card footer-card">
          <h2>Objetivo de la simulación</h2>
          <p>
            Determinar el momento exacto y las condiciones bajo las cuales el
            sistema hídrico de Boyacá cruza un umbral irreversible, configurando
            un colapso. Evaluando su resiliencia bajo el Índice ONI.
          </p>
        </article>
      </section>
    </main>
  );
}

export default App;
