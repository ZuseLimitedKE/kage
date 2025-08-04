import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

import { createFileRoute } from '@tanstack/react-router'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  type CompatiblePublicClient,
  type CompatibleWalletClient,
  useEERC,
} from "@avalabs/eerc-sdk";
import {
  useAccount,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWalletClient,
} from "wagmi";

import { Button } from '@/components/ui/button'
import { avalancheFuji } from 'viem/chains';

import erc20ABI from "@/erc20ABI.json";
import { toast } from 'sonner';
import { parseUnits } from 'viem';

export const Route = createFileRoute('/')({
  component: App,
})

// Circuit configuration
const CIRCUIT_CONFIG = {
	register: {
		wasm: "/RegistrationCircuit.wasm",
		zkey: "/RegistrationCircuit.groth16.zkey",
	},
	mint: {
		wasm: "/MintCircuit.wasm",
		zkey: "/MintCircuit.groth16.zkey",
	},
	transfer: {
		wasm: "/TransferCircuit.wasm",
		zkey: "/TransferCircuit.groth16.zkey",
	},
	withdraw: {
		wasm: "/WithdrawCircuit.wasm",
		zkey: "/WithdrawCircuit.groth16.zkey",
	},
  burn: {
    wasm: "/BurnCircuit.wasm",
		zkey: "/BurnCircuit.groth16.zkey",
  }
} as const;

function App() {
  const testTokenContractAddress = "0xce8466F83c778445429C0C71F7C91E726F943dcB"
  const {isConnected, address} = useAccount();
  const publicClient = usePublicClient({ chainId: avalancheFuji.id });
  const {data: walletClient} = useWalletClient();
  const {useEncryptedBalance, isInitialized} = useEERC(
    publicClient as CompatiblePublicClient,
    walletClient as CompatibleWalletClient,
    testTokenContractAddress,
    CIRCUIT_CONFIG
  );
  const {
    deposit,
    refetchBalance
  } = useEncryptedBalance(testTokenContractAddress);

  const { data: erc20Decimals } = useReadContract({
    abi: erc20ABI,
    functionName: "decimals",
    args: [],
    query: { enabled: !!address },
    address: testTokenContractAddress,
  }) as { data: number };

  
  const handlePrivateDeposit = async (amount: string) => {
    if (!isConnected) {
      toast.error("Connect wallet to deposit tokens")
    }

    try {
      if (!erc20Decimals) {
        toast.error("Could not get decimals of token");
        return;
      }

      if (!isInitialized) {
        toast.error("Could not initialize eERC20");
        return;
      }

      const parsedAmount = parseUnits(amount, erc20Decimals);

      const { transactionHash } = await deposit(parsedAmount);
      toast.success("Successfull deposit");
      console.log(transactionHash);
      refetchBalance();
    } catch (error) {
      console.error(error);
      toast.error("Deposit failed");
    }
  };

  return (
    <main className="p-2">
      <header>
        <ConnectButton />
      </header>
      <p>Transfer eERC20 to Anthony's account</p>

      <Button onClick={async () => await handlePrivateDeposit('1')}>
        Deposit some tokens into eERC20
      </Button>

      <Button className='ml-10'>
        Transfer funds
      </Button>
    </main>
  )
}
