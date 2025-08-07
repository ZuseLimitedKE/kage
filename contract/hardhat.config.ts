import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";

const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
const KAGE_PRIVATE_KEY = vars.get("KAGE_PRIVATE_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    avalancheFuji: {
      url: "https://avalanche-fuji.drpc.org",
      accounts: [KAGE_PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: ETHERSCAN_API_KEY
    }
  }
};

export default config;
