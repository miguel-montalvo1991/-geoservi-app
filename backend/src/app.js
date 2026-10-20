import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { notFoundHandler, errorHandler} from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import providerRoutes from "./modules/providers/provider.routes.js";
import requestRoutes from "./modules/requests/request.routes.js";


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "GeoServi-App backend funcionando" });
});


app.use("/auth", authRoutes);
app.use("/providers", providerRoutes);
app.use("/requests", requestRoutes);
app.use(notFoundHandler);
app.use(errorHandler);


export default app;
