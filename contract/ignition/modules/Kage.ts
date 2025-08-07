// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import "dotenv/config";

const KageModule = buildModule("KageModule", (m) => {
  const backendContract = process.env.BACKEND_ACCOUNT;
  if (!backendContract) {
    throw new Error("Invalid environment setup, put BACKEND_ACCOUNT in env variables");
  }

  const kage = m.contract("Kage", [backendContract]);

  return { kage };
});

export default KageModule;
