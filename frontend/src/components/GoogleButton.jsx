import { useEffect, useRef } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleButton({ onCredential, onError }) {
  const boxRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);

  // Guarda siempre la versión más reciente de los callbacks
  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!CLIENT_ID) {
      onErrorRef.current?.('Falta VITE_GOOGLE_CLIENT_ID en frontend/.env');
      return;
    }

    let cancelled = false;
    let intentos = 0;

    function iniciar() {
      if (cancelled) return;

      // El script de Google carga de forma asíncrona: esperamos a que esté listo
      if (!window.google?.accounts?.id) {
        if (intentos++ < 50) {
          setTimeout(iniciar, 100);
        } else {
          onErrorRef.current?.('No se pudo cargar Google. Revisa tu conexión a internet.');
        }
        return;
      }

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (resp) => onCredentialRef.current?.(resp.credential),
      });

      // Google exige un ancho en píxeles entre 200 y 400
      const ancho = Math.min(400, Math.max(200, boxRef.current.offsetWidth));
      window.google.accounts.id.renderButton(boxRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'center',
        width: ancho,
      });
    }

    iniciar();
    return () => {
      cancelled = true;
    };
  }, []);

  return <div ref={boxRef} className="w-full flex justify-center" />;
}