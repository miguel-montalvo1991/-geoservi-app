import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register({ onSwitchToLogin }) {
  const { registrar } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "cliente" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registrar(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "3rem auto" }}>
      <h2>Crear cuenta</h2>

      <input
        name="name"
        placeholder="Nombre"
        value={form.name}
        onChange={handleChange}
        required
        style={{ display: "block", width: "100%", marginBottom: 8 }}
      />
      <input
        name="email"
        type="email"
        placeholder="Correo"
        value={form.email}
        onChange={handleChange}
        required
        style={{ display: "block", width: "100%", marginBottom: 8 }}
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={handleChange}
        required
        style={{ display: "block", width: "100%", marginBottom: 8 }}
      />

      {/* El rol "administrador" NO está aquí a propósito: el backend lo bloquea
          en el registro público (solo se crea con el script seed:admin) */}
      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        style={{ display: "block", width: "100%", marginBottom: 8 }}
      >
        <option value="cliente">Cliente</option>
        <option value="prestador">Prestador</option>
      </select>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Creando cuenta..." : "Registrarme"}
      </button>

      <p style={{ marginTop: 12, fontSize: "0.9rem" }}>
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{ background: "none", border: "none", color: "#3ed598", cursor: "pointer", padding: 0 }}
        >
          Inicia sesión
        </button>
      </p>
    </form>
  );
}