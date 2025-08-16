import { toast } from "sonner";
import { Button } from "../ui/button";
import registerABI from "@/registrarABI.json";
import { groth16, type CircuitSignals } from "snarkjs"
import { User } from "@/eerc/user";
import { useAccount, useConnectorClient, type Config, type Transport } from "wagmi";
import { useReadContract, useWriteContract } from "wagmi";
import { ethers, FallbackProvider, JsonRpcProvider } from "ethers"
export default function RegisterButton() {
  const { writeContractAsync } = useWriteContract();
  async function handleRegister() {
    const { address, chainId } = useAccount();
    const { data: client } = useConnectorClient<Config>({ chainId });
    try {
      toast.info("Registering user on eERC");
      const registrarAddress = "0xcF1651fbD98491AE2f972b144D2DC41BC4c8F027";

      // TODO: Call the isRegistered function to check if registered
      const result = await useReadContract({
        abi: registerABI,
        address: registrarAddress,
        functionName: ,
      });
      //
      // TODO: Generate a public and private key form signatures
      // TODO: Generate registration hash using poseidon

      toast.info("Getting account details");
      if (!client) {
        toast.error("Could not get client");
        return;
      }
      const { account, chain, transport } = client
      toast.info("Getting user");
      const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
      }

      let provider;
      if (transport.type === 'fallback') {
        provider = new FallbackProvider((transport.transports as ReturnType<Transport>[]).map(
          ({ value }) => new JsonRpcProvider(value?.url, network),
        ),)
      }

      provider = new JsonRpcProvider(transport.url, network);
      const signer = await provider.getSigner(account.address);
      const user = new User(signer);
      const registrationHash = user.genRegistrationHash(BigInt(chainId!));
      const input: CircuitSignals = {
        SenderPrivateKey: user.formattedPrivateKey,
        SenderPublicKey: user.publicKey,
        SenderAddress: BigInt(user.signer.address),
        ChainID: chainId!,
        RegistrationHash: registrationHash,
      }
      // TODO: Generate proof using snark
      const { proof, publicSignals } = await groth16.fullProve(
        input,
        "/RegistrationCircuit.wasm",
        "/RegistrationCircuit.groth16.zkey");

      console.log(publicSignals);
      console.log(proof);
      // TODO: Format proof for sending to contract
      toast.info("Calling the contract");
      let a = proof.pi_a.slice(0, 2);
      let proofa = a.map((i) => BigInt(i));

      let c = proof.pi_c.slice(0, 2);
      let proofc = c.map((i) => BigInt(i));

      let b = proof.pi_b.slice(0, 2);
      let shortB = b.map((i) => i.slice(0, 2));
      let proofb = shortB.map((i) => i.map((j) => BigInt(j)));
      // TODO: Call register function
      const transactionHash = await writeContractAsync({
        abi: registerABI,
        address: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
        functionName: 'register',
        args: [
          {
            proofPoints: {
              a: proofa,
              b: proofb,
              c: proofc
            },
            publicSignals: publicSignals,
          }
        ]

      }
      )
      console.log("transaction hash=>", transactionHash)
      toast.success("Registered user succesfully");
    } catch (err) {
      toast.error("Error registering user");
      console.error(err);
    }
  }
  return (
    <Button onClick={handleRegister}>
      Register to contract
    </Button>
  );
}
