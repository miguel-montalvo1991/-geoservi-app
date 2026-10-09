import { useEffect, useState } from "react";
import "./RadarScanner.css";

// Datos de ejemplo: esto se reemplaza más adelante por la respuesta real de
// GET /service-requests/nearby (o el endpoint que se construya en el módulo
// service_requests, que todavía no existe). Por ahora simula 4 servicios
// "detectados" alrededor del usuario, cada uno con un ángulo y una distancia.
const SERVICIOS_EJEMPLO = [
  { id: 1, nombre: "Plomero", angulo: 40, distancia: 70 },
  { id: 2, nombre: "Electricista", angulo: 130, distancia: 55 },
  { id: 3, nombre: "Cerrajero", angulo: 210, distancia: 85 },
  { id: 4, nombre: "Jardinero", angulo: 290, distancia: 45 },
];

export default function RadarScanner({ onComplete }) {
  const [encontrados, setEncontrados] = useState([]);

  useEffect(() => {
    // Revela cada servicio en un momento distinto, simulando que el radar
    // los va detectando uno por uno en vez de que aparezcan todos de golpe.
    const timers = SERVICIOS_EJEMPLO.map((servicio, index) =>
      setTimeout(() => {
        setEncontrados((prev) => [...prev, servicio]);
      }, 900 * (index + 1))
    );

    // Cuando termina la "búsqueda", avisa al componente padre con los datos encontrados
    const finTimer = setTimeout(() => {
      onComplete?.(SERVICIOS_EJEMPLO);
    }, 900 * SERVICIOS_EJEMPLO.length + 800);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finTimer);
    };
  }, [onComplete]);

  // Convierte ángulo + distancia (coordenadas polares) a un porcentaje x/y
  // para posicionar el blip dentro del círculo del radar
  function posicion(angulo, distancia) {
    const rad = (angulo * Math.PI) / 180;
    const x = 50 + distancia * Math.cos(rad) * 0.5;
    const y = 50 + distancia * Math.sin(rad) * 0.5;
    return { left: `${x}%`, top: `${y}%` };
  }

  return (
    <div className="radar-wrapper">
      <div className="radar-circle">
        <div className="radar-ring radar-ring--1" />
        <div className="radar-ring radar-ring--2" />
        <div className="radar-ring radar-ring--3" />
        <div className="radar-sweep" />
        <div className="radar-center" />

        {encontrados.map((servicio) => (
          <div
            key={servicio.id}
            className="radar-blip"
            style={posicion(servicio.angulo, servicio.distancia)}
            title={servicio.nombre}
          >
            <span className="radar-blip__label">{servicio.nombre}</span>
          </div>
        ))}
      </div>

      <p className="radar-status">
        Buscando servicios cerca de ti
        {encontrados.length > 0 && ` · ${encontrados.length} encontrados`}
      </p>
    </div>
  );
}