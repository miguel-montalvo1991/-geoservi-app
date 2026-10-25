import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const OFICIOS = ["Plomero", "Electricista", "Cerrajero", "Jardinero"];

function obtenerUbicacion() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Este navegador no permite obtener la ubicación."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      (error) => reject(new Error(error.code === error.PERMISSION_DENIED
        ? "Permite el acceso a tu ubicación para publicar la solicitud."
        : "No pudimos obtener tu ubicación. Inténtalo de nuevo.")),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

export default function Home() {
  const { user, token, logout } = useAuth();
  const [seleccionado, setSeleccionado] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [solicitudes, setSolicitudes] = useState([]);
  const [errorHistorial, setErrorHistorial] = useState("");
  const [notificaciones, setNotificaciones] = useState([]);
  const [errorNotificaciones, setErrorNotificaciones] = useState("");

  useEffect(() => {
    if (user.role !== "cliente") return;
    apiFetch("/requests/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then((data) => setSolicitudes(data.requests))
      .catch((err) => setErrorHistorial(err.message));
  }, [token, user.role]);

  useEffect(() => {
    if (user.role !== "prestador") return;

    let cancelled = false;
    async function cargarNotificaciones() {
      try {
        const data = await apiFetch("/notifications/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) {
          setNotificaciones(data.notifications);
          setErrorNotificaciones("");
        }
      } catch (err) {
        if (!cancelled) setErrorNotificaciones(err.message);
      }
    }

    cargarNotificaciones();
    const intervalId = window.setInterval(cargarNotificaciones, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [token, user.role]);

  async function marcarNotificacionLeida(id) {
    setErrorNotificaciones("");
    try {
      const data = await apiFetch(`/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificaciones((actuales) => actuales.map((notificacion) =>
        notificacion.id === id ? data.notification : notificacion
      ));
    } catch (err) {
      setErrorNotificaciones(err.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!seleccionado) return;
    setError("");
    setMensaje("");
    setEnviando(true);
    try {
      const ubicacion = await obtenerUbicacion();
      const data = await apiFetch("/requests", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oficio_needed: seleccionado, title: titulo.trim(), description: descripcion.trim(), ...ubicacion }),
      });
      setSolicitudes((actuales) => [data.request, ...actuales]);
      setTitulo("");
      setDescripcion("");
      setMensaje("Tu solicitud se publicó correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="home">
      <header className="home__header">
        <h1 className="home__title">GeoServi-App</h1>
        <p className="home__subtitle">
          {user.email} <span className="role-badge">{user.role}</span>
        </p>
      </header>

      {user.role === "cliente" ? (
        <>
          <h2 className="home__section-title">¿Qué servicio necesitas?</h2>

          <ul className="service-list">
            {OFICIOS.map((oficio) => (
              <li key={oficio}>
                <button
                  type="button"
                  className={
                    "service-card" +
                    (seleccionado === oficio ? " service-card--selected" : "")
                  }
                  onClick={() => setSeleccionado(oficio)}
                >
                  <span className="service-card__name">{oficio}</span>
                  <span className="service-card__meta">Seleccionar oficio</span>
                </button>
              </li>
            ))}
          </ul>

          {seleccionado && (
            <form className="service-detail" onSubmit={handleSubmit}>
              <p className="service-detail__text">
                Solicitud para: <strong>{seleccionado}</strong>
              </p>
              <label className="request-field">
                Título
                <input
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  minLength={3}
                  maxLength={150}
                  placeholder="Ej. Reparar una fuga en la cocina"
                  required
                />
              </label>
              <label className="request-field">
                Describe lo que necesitas
                <textarea
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                  minLength={10}
                  maxLength={5000}
                  rows={4}
                  placeholder="Cuéntanos qué ocurrió y qué trabajo necesitas."
                  required
                />
              </label>
              <p className="service-detail__note">
                Usaremos tu ubicación actual para registrar dónde necesitas el servicio.
              </p>
              {error && (
                <p className="form-message form-message--error" role="alert">
                  {error}
                </p>
              )}
              {mensaje && (
                <p className="form-message form-message--success" role="status">
                  {mensaje}
                </p>
              )}
              <button className="btn btn--primary" type="submit" disabled={enviando}>
                {enviando ? "Publicando solicitud..." : "Publicar solicitud"}
              </button>
            </form>
          )}

          <section className="request-history" aria-labelledby="request-history-title">
            <h2 id="request-history-title" className="home__section-title">Mis solicitudes</h2>
            {errorHistorial && (
              <p className="form-message form-message--error" role="alert">
                {errorHistorial}
              </p>
            )}
            {!errorHistorial && solicitudes.length === 0 && (
              <p className="service-detail__note">
                Aún no has publicado solicitudes.
              </p>
            )}
            {solicitudes.length > 0 && (
              <ul className="request-history__list">
                {solicitudes.map((solicitud) => (
                  <li className="request-history__item" key={solicitud.id}>
                    <strong>{solicitud.title}</strong>
                    <span>{solicitud.oficio_needed} · {solicitud.status}</span>
                    <p>{solicitud.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <section className="request-history" aria-labelledby="notifications-title">
          <h2 id="notifications-title" className="home__section-title">
            Solicitudes cercanas
            {notificaciones.some((notificacion) => !notificacion.read_at) && (
              <span className="notification-count" aria-label="Tienes avisos sin leer">
                {notificaciones.filter((notificacion) => !notificacion.read_at).length} nuevas
              </span>
            )}
          </h2>
          {errorNotificaciones && (
            <p className="form-message form-message--error" role="alert">
              {errorNotificaciones}
            </p>
          )}
          {!errorNotificaciones && notificaciones.length === 0 && (
            <p className="service-detail__note">
              Cuando se publique una solicitud de tu oficio cerca de tu ubicación, aparecerá aquí.
            </p>
          )}
          {notificaciones.length > 0 && (
            <ul className="request-history__list">
              {notificaciones.map((notificacion) => (
                <li
                  className={`request-history__item${notificacion.read_at ? "" : " notification-item--unread"}`}
                  key={notificacion.id}
                >
                  <strong>{notificacion.title}</strong>
                  <span>{new Date(notificacion.created_at).toLocaleString()}</span>
                  <p>{notificacion.message}</p>
                  {!notificacion.read_at && (
                    <button
                      className="btn btn--ghost notification-item__action"
                      type="button"
                      onClick={() => marcarNotificacionLeida(notificacion.id)}
                    >
                      Marcar como leída
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <button className="btn btn--ghost home__logout" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}
