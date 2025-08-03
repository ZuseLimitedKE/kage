import { Router } from "express";
import orderController from "../controllers/orders";
import { Errors } from "../constants/errors";
import { OrdersSchema } from "../schema/orders";
import { $ZodIssue } from "zod/v4/core";

const router: Router = Router();

router.post("/", async (req, res) => {
  try {
    const requestBody = req.body;
    const parsed = OrdersSchema.safeParse(requestBody);
    if (parsed.success) {
      const order = parsed.data;
      await orderController.createOrder(order);
      res.status(201).json({ msg: "successfully created the order" });
    } else {
      const errors = parsed.error.issues.map(
        (issue: $ZodIssue) => issue.message,
      );
      res.status(400).json({ error: errors });
    }
  } catch (error) {
    console.error("Error creating order", error);
    res.status(500).json({ error: Errors.INTERNAL_SERVER_ERROR });
  }
});

export default router;
