"use client";

import { toast } from "sonner";
import { Button } from "../ui/button";
import registerABI from "@/registrarABI.json";
import { useReadContract, useAccount, useSignMessage } from "wagmi";
import web3 from "web3";
import {Base8, mulPointEscalar, subOrder} from "@zk-kit/baby-jubjub";
import {PrivateKey} from "babyjubjub";

function bytesToBigInt(byteArray: Uint8Array) {
    const hexString = Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
    return BigInt('0x' + hexString);
}

// Function to derive 32 bytes from signature (i0 function)
export function i0(signature: string): bigint {
    if (typeof signature !== "string" || signature.length < 132)
      throw new Error("Invalid signature hex string");
  
    const hash = web3.utils.sha3(signature as `0x${string}`);           // 0x…
    if (hash === undefined) {
        throw new Error("Error getting hash");
    }
    const cleanSig = hash.startsWith("0x") ? hash.slice(2) : hash;
    let bytes = Uint8Array.from(Buffer.from(cleanSig, 'hex'));               // Uint8Array(32)
  
    bytes[0]  &= 0b11111000;
    bytes[31] &= 0b01111111;
    bytes[31] |= 0b01000000;
  
    const le = bytes.reverse();                  // noble utils entrega big-endian
    let sk = bytesToBigInt(le); 
  
    sk %= subOrder;
    if (sk === BigInt(0)) sk = BigInt(1);                      // nunca cero
    return sk;                                   // listo para mulPointEscalar
}


export default function RegisterButton() {
    const {address, isConnected} = useAccount();
    const {signMessageAsync} = useSignMessage();
    const registrarAddress = "0xcF1651fbD98491AE2f972b144D2DC41BC4c8F027"; 
    const {data: isRegistered, isLoading: registerLoading, isError: registerError, error: dataError} = useReadContract({
        abi: registerABI,
        address: registrarAddress,
        functionName: "isUserRegistered",
        args: [address]
    });

    async function handleRegister() {
        try {
            toast.info("Registering user on eERC");

            if (isConnected === false) {
                toast.error("Please connect your wallet to register");
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

            console.log(isRegistered);
            if (isRegistered) {
                toast.success("You are already registered");
                return;
            }
            // TODO: Generate a public and private key form signatures
            const signedMessage = await signMessageAsync({message: "I want to register with eERC"});
            const privateKey = i0(signedMessage);

            const publicKey = mulPointEscalar(Base8, privateKey).map((x) => BigInt(x));
            console.log("Public key X:", publicKey[0].toString());
            console.log("Public key Y:", publicKey[1].toString());

            // TODO: Generate registration hash using poseidon
            
            // TODO: Generate proof using snark
            //
            // TODO: Format proof for sending to contract
            //
            // TODO: Call register function
            toast.success("Registered user succesfully");
        } catch(err) {
            toast.error("Error registering user");
            console.error(err);
        }
    }

    return (
        <Button 
            onClick={handleRegister}
            disabled={registerLoading || registerError}
        >
            {registerLoading ? "Getting if registered" : registerError ? "Could not check if already registered": "Register to contract"}
        </Button>
    );
}
