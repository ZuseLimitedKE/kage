import client from "./connection";

const databaseName = "kage";
const database = client.db(databaseName);

export interface USERS {
  address: string;
}

export interface ORDERS {
  order_type: "buy" | "sell";
  amount: number;
  rate: number;
}

const userCollection = "users";
const orderCollection = "orders";
export const USERS_COLLECTION = database.collection<USERS>(userCollection);
export const ORDER_COLLECTION = database.collection<ORDERS>(orderCollection);
