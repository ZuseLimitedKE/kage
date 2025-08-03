import { ORDER_COLLECTION, ORDERS } from "../lib/collections";
import { MyError, Errors } from "../constants/errors";
export class OrderModel {
  async CreateOrder(order: ORDERS) {
    try {
      await ORDER_COLLECTION.insertOne(order);
    } catch (error) {
      throw new MyError("error:" + Errors.NOT_CREATE_ORDER);
    }
  }
}

const orderModel = new OrderModel();
export default orderModel;
