import {
  AlertTriangle,
  BarChart3,
  Droplets,
  Gauge,
  LineChart,
  MapPinned,
  Waves,
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

const variables = [
  "Volumen almacenado, nivel del embalse y capacidad total por ciudad.",
  "Caudal de entrada, evaporacion, filtracion y demandas domestica, agricola e industrial.",
  "Indice ONI, anomalia de precipitacion, temperatura y demanda per capita.",
] as const;

const scenarios = [
  {
    name: "Linea base",
    detail: "Serie historica 2000-2023 para calibrar y validar el modelo.",
  },
  {
    name: "El Nino moderado recurrente",
    detail: "ONI +1.0 a +1.5 durante 8-12 meses cada 5 anos, con PNR estimado entre 2030 y 2035.",
  },
  {
    name: "El Nino extraordinario prolongado",
    detail: "ONI +2.0 a +3.0 durante 18-24 meses continuos, con colapso acelerado antes de 2030.",
  },
] as const;

const interventions = [
  "Restricciones de demanda y racionamiento escalonado.",
  "Nuevas fuentes de abastecimiento y almacenamiento.",
  "Mejoras de eficiencia en red y reduccion de perdidas.",
] as const;

function App() {
  return (
    <main className="landing-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Proyecto de simulacion hidrica regional</span>
          <h1>Colapso hidrico regional en Boyaca bajo estres extremo de El Nino</h1>
          <p className="hero-lead">
            Esta landing resume el modelo Forrester propuesto para anticipar
            cuando Tunja, Duitama y Sogamoso cruzan un punto de no retorno en
            sus reservas de agua.
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
            <h2>Contexto</h2>
          </div>
          <p>
            El sistema depende de embalses, rios de paramo y acuiferos de
            recarga lenta. Eventos recientes como 1997-1998, 2015-2016 y
            2023-2024 expusieron racionamientos, caidas criticas de reservas y
            conflicto entre usos domesticos, agricolas e industriales.
          </p>
        </article>

        <article className="info-card">
          <div className="card-title">
            <Gauge size={18} />
            <h2>Hipotesis</h2>
          </div>
          <p>
            El sistema presenta un colapso suave seguido de un colapso abrupto
            cuando las reservas bajan de un umbral critico y se activan
            retroalimentaciones positivas como sobreextraccion, deterioro del
            paramo y mayores perdidas por evaporacion.
          </p>
        </article>

        <article className="info-card">
          <div className="card-title">
            <LineChart size={18} />
            <h2>Horizonte</h2>
          </div>
          <p>
            La simulacion usa calibracion historica 2000-2023 y un paso mensual,
            con analisis diario para eventos criticos y proyecciones enfocadas
            en la siguiente decada.
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
            <h2>Variables principales</h2>
          </div>
          <ul className="bullet-list">
            {variables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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

      <section className="footer-panel">
        <article className="info-card footer-card">
          <h2>Politicas evaluadas</h2>
          <ul className="bullet-list">
            {interventions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="info-card footer-card">
          <h2>Objetivo de la landing</h2>
          <p>
            Reemplazar la vista de diagramas por una portada clara del proyecto:
            el problema, el territorio, el umbral critico y los escenarios que
            guiaron el modelo descrito en <code>DOMAIN_DOC.html</code>.
          </p>
        </article>
      </section>
    </main>
  );
}

export default App;
