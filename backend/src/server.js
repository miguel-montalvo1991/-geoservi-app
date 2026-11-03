import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, (err) => {
  if (err) {
    console.error("No se pudo iniciar el servidor:", err);
    process.exit(1);
  }
  console.log(`Servidor backend activo en http://localhost:${PORT}`);
});