import express from "express";
import { healthHandler } from "./health";
import { authRouter } from "./auth/auth.router";

const app = express();
const port = process.env.PORT ?? 3001;

app.use(express.json());

app.get("/api/v1/health", healthHandler);
app.use("/api/v1/auth", authRouter);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
