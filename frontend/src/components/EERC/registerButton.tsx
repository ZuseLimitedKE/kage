import { toast } from "sonner";
import { Button } from "../ui/button";
import registerABI from "@/registrarABI.json";
import { formatPrivKeyForBabyJub } from "maci-crypto";
import {
  type CircuitSignals,
  type Groth16Proof,
  type PublicSignals,
} from "snarkjs";
import { useConnectorClient, type Config, type Transport } from "wagmi";
import {
  useReadContract,
  useAccount,
  useSignMessage,
  useWriteContract,
} from "wagmi";
import web3 from "web3";
import { Base8, mulPointEscalar, subOrder } from "@zk-kit/baby-jubjub";
import { poseidon3 } from "poseidon-lite";
import { prove } from "@zk-kit/groth16";
function bytesToBigInt(byteArray: Uint8Array) {
  const hexString = Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
  return BigInt("0x" + hexString);
}

// Function to derive 32 bytes from signature (i0 function)
export function i0(signature: string): bigint {
  if (typeof signature !== "string" || signature.length < 132)
    throw new Error("Invalid signature hex string");

  const hash = web3.utils.sha3(signature as `0x${string}`); // 0x…
  if (hash === undefined) {
    throw new Error("Error getting hash");
  }
  const cleanSig = hash.startsWith("0x") ? hash.slice(2) : hash;
  let bytes = Uint8Array.from(Buffer.from(cleanSig, "hex")); // Uint8Array(32)

  bytes[0] &= 0b11111000;
  bytes[31] &= 0b01111111;
  bytes[31] |= 0b01000000;

  const le = bytes.reverse(); // noble utils entrega big-endian
  let sk = bytesToBigInt(le);

  sk %= subOrder;
  if (sk === BigInt(0)) sk = BigInt(1); // nunca cero
  return sk; // listo para mulPointEscalar
}

// Correct way to format proof points for Groth16
function getCallData(proof: Groth16Proof, publicSignals: PublicSignals) {
  return {
    proofPoints: {
      a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])],
      b: [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ],
      c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])],
    },
    publicSignals: publicSignals.slice(0, 5).map((p) => BigInt(p)),
  };

  // return {
  //     a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])],
  //     b: [
  //         [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])], // Note the reversed order
  //         [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])]  // This is typical for G2 points
  //     ],
  //     c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])]
  // };
}

export default function RegisterButton() {
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  // const registrarAddress = "0xcF1651fbD98491AE2f972b144D2DC41BC4c8F027"; // Avalanche fuji address
  const registrarAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
  const {
    data: isRegistered,
    isLoading: registerLoading,
    isError: registerError,
    error: dataError,
  } = useReadContract({
    abi: registerABI,
    address: registrarAddress,
    functionName: "isUserRegistered",
    args: [address],
  });
  const { writeContractAsync } = useWriteContract();
  const { data: client } = useConnectorClient<Config>({ chainId });

  async function handleRegister() {
    try {
      toast.info("Registering user on eERC");

      if (isConnected === false || address === undefined) {
        toast.error("Please connect your wallet to register");
        return;
      }
      // TODO: Call the isRegistered function to check if registered
      if (registerLoading) {
        toast.error("Getting if you've been registered, please wait");
        return;
      } else if (registerError) {
        toast.error("Could not get if you've already been registered");
        console.log(dataError);
        return;
      }

      console.log("Is Registered", isRegistered);
      if (isRegistered) {
        toast.success("You are already registered");
        return;
      }
      // TODO: Generate a public and private key form signatures
      const message = `eERC Registering user with  Address:${address.toLowerCase()}`;
      console.log("Message to be signed", message);

      const signedMessage = await signMessageAsync({ message: message });
      const privateKey = i0(signedMessage);
      console.log("Private key (raw): ", privateKey.toString());

      const formattedPrivateKey = formatPrivKeyForBabyJub(privateKey);
      console.log("Private key (formatted): ", formattedPrivateKey);

      const publicKey = mulPointEscalar(Base8, formattedPrivateKey).map((x) =>
        BigInt(x),
      );
      console.log("Public key X", publicKey[0]);
      console.log("Public key Y: ", publicKey[1]);

      toast.info("Getting account details");
      if (!client) {
        toast.error("Could not get client");
        return;
      }
      const { account, chain, transport } = client;
      toast.info("Getting user");
      const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
      };
      console.log("Network", network);

      // let provider;
      // if (transport.type === 'fallback') {
      //     console.log("Fallback");
      //     provider = new FallbackProvider((transport.transports as ReturnType<Transport>[]).map(
      //         ({ value }) => new JsonRpcProvider(value?.url, network),
      //     ),)
      // }

      // provider = new BrowserProvider(transport, network);
      // // provider = new JsonRpcProvider("https://avalanche-fuji-c-chain-rpc.publicnode.com", network);
      // console.log("Provider", provider);
      // const signer = await provider.getSigner(account.address);
      // console.log("Signer", signer);
      // const user = new User(signer);
      // console.log("User", user);

      const registrationHash = poseidon3([
        BigInt(chainId!),
        formattedPrivateKey,
        BigInt(address),
      ]);
      console.log("Registration hash", registrationHash);

      const input: CircuitSignals = {
        SenderPrivateKey: formattedPrivateKey,
        SenderPublicKey: [publicKey[0], publicKey[1]],
        SenderAddress: BigInt(address),
        ChainID: BigInt(chainId!),
        RegistrationHash: registrationHash,
      };

      const response = await fetch("http://localhost:3500/api/v1/proofs", {
        method: "POST",
        headers: {
          'Content-Type': "application/json"
        },
        body: JSON.stringify({
          SenderPrivateKey: formattedPrivateKey.toString(),
          SenderPublicKey: [publicKey[0].toString(), publicKey[1].toString()],
          SenderAddress: address,
          ChainID: chainId!,
          RegistrationHash: registrationHash.toString(),
        })
      });

      const resBody = await response.json();
      if (!response.ok) {
        toast.error("Could not generate proof");
        console.log("Error generating proof", resBody);
      }

      console.log("Generated proof");
      console.log(resBody);
      const calldata = getCallData(resBody.proof, resBody.publicSignals);

      // console.log("Circuit Inputs", input);

      // // TODO: Generate proof using snark
      // const proof = await prove(
      //   input,
      //   "/RegistrationCircuit.wasm",
      //   "/RegistrationCircuit.groth16.zkey",
      // );
      // // const { proof, publicSignals } = await groth16.fullProve(
      // //   input,
      // //   "/RegistrationCircuit.wasm",
      // //   "/RegistrationCircuit.groth16.zkey",
      // // );

      // console.log(`\n Public Signals \n`);
      // console.log(proof.publicSignals);
      // console.log(`\n Proof \n`);
      // console.log(proof);
      // // TODO: Format proof for sending to contract

      // toast.info("Calling the contract");
      // const calldata = getCallData(proof.proof, proof.publicSignals);
      // console.log("Calldata");
      // console.log(calldata);
      // TODO: Call register function
      const transactionHash = await writeContractAsync({
        abi: registerABI,
        address: registrarAddress,
        functionName: "register",
        args: [calldata],
      });
      console.log("transaction hash=>", transactionHash);
      toast.success("Registered user succesfully");
    } catch (err) {
      toast.error("Error registering user");
      console.error(err);
    }
  }

  return (
    <Button
      onClick={handleRegister}
      disabled={registerLoading || registerError}
    >
      {registerLoading
        ? "Getting if registered"
        : registerError
          ? "Could not check if already registered"
          : "Register to contract"}
    </Button>
  );
}
