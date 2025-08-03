import Express, { json, Request, Response } from "express";
import { MyError, Errors } from "./constants/errors";
if (!process.env.PORT) {
  console.log("Set PORT in env variables");
  throw new MyError(Errors.INVALID_SETUP);
}
const app = Express();

app.use(json());

app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "Home route" });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on port:${port}`);
});
