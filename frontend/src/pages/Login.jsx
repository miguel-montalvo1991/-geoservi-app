import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/GoogleButton';

/**
 * Pantalla "Iniciar sesión" de GeoServi-App.
 * Mismo diseño que la pantalla de registro (Tailwind, tarjeta redondeada, botón de Google).
 *
 * Prop (la misma que ya usa App.jsx):
 *  - onSwitchToRegister: cambia a la pantalla de registro.
 */
export default function Login({ onSwitchToRegister }) {
  // Funciones que expone tu AuthContext
  const { login, loginConGoogle } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Actualiza el campo que cambió
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);

      // login(email, password) hace el POST /auth/login, guarda el token
      // y actualiza "user".
      const result = await login(formData.email.trim(), formData.password);

      // Si tu login devuelve { ok: false, error } en vez de lanzar una excepción,
      // también mostramos ese mensaje.
      if (result && result.ok === false) {
        setError(result.error || 'Credenciales inválidas.');
      }
      // Si todo sale bien, el contexto actualiza "user" y App.jsx muestra <Home />.
    } catch (err) {
      // Mensaje del backend (por ejemplo "Credenciales invalidas") o error de red
      setError(err?.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  // Google entrega un "credential"; el backend lo verifica y devuelve nuestro token.
  // Si el correo no tiene cuenta, el backend responde que primero hay que registrarse.
  const handleGoogleCredential = async (credential) => {
    setError('');
    try {
      setLoading(true);
      await loginConGoogle(credential);
    } catch (err) {
      setError(err?.message || 'No se pudo iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex justify-center items-center p-4 text-[#0F172A] font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col">
        {/* Chip Geoservi */}
        <div className="flex items-center mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
            <svg className="w-4 h-4 fill-indigo-600" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
            </svg>
            <span>Geoservi</span>
          </div>
        </div>

        {/* Título & Subtítulo */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Bienvenido de nuevo
          </h1>
          <p className="text-slate-500 text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Correo electrónico */}
          <div className="relative">
            <label className="text-xs font-medium text-slate-500 block mb-1">Correo electrónico</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="carlos.mendoza@email.com"
                autoComplete="email"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="relative">
            <label className="text-xs font-medium text-slate-500 block mb-1">Contraseña</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
              {/* Botón ojo: muestra u oculta la contraseña */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 transition"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mensaje de error (solo aparece si hay uno) */}
          {error && (
            <p role="alert" className="text-xs text-red-600 font-medium">
              {error}
            </p>
          )}

          {/* Botón principal (se deshabilita mientras se envía) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl shadow-sm hover:bg-indigo-700 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Ingresando...' : 'Ingresar'}</span>
          </button>
        </form>

        {/* Separador */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="px-3 text-xs text-slate-400 font-medium">O continúa con</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        {/* Botón Google (lo dibuja Google) */}
        <GoogleButton onCredential={handleGoogleCredential} onError={setError} />

        {/* Pie: Registrarse */}
        <p className="mt-8 text-center text-xs sm:text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <a
            href="#registro"
            onClick={(e) => {
              e.preventDefault(); // evita el salto de la URL
              if (onSwitchToRegister) onSwitchToRegister();
            }}
            className="text-indigo-600 font-bold hover:underline"
          >
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}