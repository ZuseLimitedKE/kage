import Express, { json, Request, Response, NextFunction } from "express";
import cors from "cors";
import orderRoutes from "./routes/orders";
import proofRoutes from "./routes/proof";
import "dotenv/config";

const app = Express();
app.use(cors());
app.use(json());
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/proofs", proofRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "Home route" });
});


//Global error handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error:", err);
  // Handle known errors
  if (err instanceof Error) {
    res.status(500).json({
      error: err.message,
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    error: "An unexpected error occurred",
  });
});
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
