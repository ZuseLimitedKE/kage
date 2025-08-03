import orderModel, { OrderModel } from "../models/orders";
import { CreateOrder } from "../schema/orders";

export class OrderController {
  private orderModel: OrderModel;

  constructor(orderModel: OrderModel) {
    this.orderModel = orderModel;
  }
  async createOrder(order: CreateOrder) {
    try {
      await this.orderModel.CreateOrder(order);
    } catch (error) {
      console.error("order controller error:", error);
      throw error;
    }
  }
}

const orderController = new OrderController(orderModel);
export default orderController;
