import Express, { json, Request, Response } from "express";

const app = Express();

app.use(json());

app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "Home route" });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
