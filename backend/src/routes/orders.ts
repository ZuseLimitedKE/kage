import { Router } from "express";
import orderController from "../controllers/orders";
import { Errors } from "../constants/errors";
import { OrdersSchema } from "../schema/orders";
import { validateBody } from "../middleware/validate";

const router: Router = Router();

router.post("/", validateBody(OrdersSchema), async (req, res) => {
  try {
    await orderController.createOrder(req.body);
    res.status(201).json({ msg: "successfully created the order" });
  } catch (error) {
    console.error("Error creating order", error);
    res.status(500).json({ error: Errors.INTERNAL_SERVER_ERROR });
  }
});

export default router;
