import { useState } from "react";
import RadarScanner from "../components/RadarScanner";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

export default function Home() {
  const { user, logout } = useAuth();
  const [servicios, setServicios] = useState(null); // null = todavía buscando
  const [seleccionado, setSeleccionado] = useState(null);

  return (
    <div className="home">
      <header className="home__header">
        <h1 className="home__title">GeoServi-App</h1>
        <p className="home__subtitle">
          {user.email} <span className="role-badge">{user.role}</span>
        </p>
      </header>

      {servicios === null ? (
        <RadarScanner onComplete={setServicios} />
      ) : (
        <>
          <h2 className="home__section-title">Servicios cerca de ti</h2>

          <ul className="service-list">
            {servicios.map((s) => (
              <li key={s.id}>
                {/* Cada servicio es clickeable: al seleccionarlo se resalta y
                    abre el panel de detalle de abajo */}
                <button
                  className={
                    "service-card" +
                    (seleccionado?.id === s.id ? " service-card--selected" : "")
                  }
                  onClick={() => setSeleccionado(s)}
                >
                  <span className="service-card__name">{s.nombre}</span>
                  <span className="service-card__meta">Disponible ahora</span>
                </button>
              </li>
            ))}
          </ul>

          {seleccionado && (
            <div className="service-detail">
              <p className="service-detail__text">
                Vas a solicitar: <strong>{seleccionado.nombre}</strong>
              </p>
              {/* El backend todavía no tiene el módulo service_requests, así que
                  el botón queda deshabilitado y con nota honesta en vez de fingir
                  que la solicitud se envía de verdad */}
              <p className="service-detail__note">
                El envío real de solicitudes aún no está construido en el backend
                (módulo service_requests, siguiente en el roadmap). Por ahora esta
                pantalla solo confirma la selección.
              </p>
              <button className="btn btn--primary" disabled>
                Solicitar servicio (próximamente)
              </button>
            </div>
          )}
        </>
      )}

      <button className="btn btn--ghost home__logout" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}