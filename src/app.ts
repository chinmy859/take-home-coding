import express, { Application } from "express";
import dotenv from "dotenv";
import movieRoutes from "./routes/movies.routes";

dotenv.config();

const app: Application = express();

app.use(express.json());

app.use("/api/movies", movieRoutes);

export default app;
