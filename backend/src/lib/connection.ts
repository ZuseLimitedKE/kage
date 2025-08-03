import "dotenv/config";
import { MongoClient } from "mongodb";
import { MyError, Errors } from "../constants/errors";

if (!process.env.CONN_STRING) {
  console.log("Set CONN_STRING in env variables");
  throw new MyError(Errors.INVALID_SETUP);
}

const uri = process.env.CONN_STRING;
const options = {};

let client: MongoClient = new MongoClient(uri, options);

export default client;
