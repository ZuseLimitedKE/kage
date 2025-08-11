import { toast } from "sonner";
import { Button } from "../ui/button";
import { groth16 } from "snarkjs";
import { useAccount, useConnectorClient, type Config, type Transport } from "wagmi";
import { ethers, FallbackProvider, JsonRpcProvider } from 'ethers'
import { User } from "@/eerc/user";
import { useWriteContract } from "wagmi";
import registerABI from "@/registerABI.json";
import {utils} from "web3";

export default function RegiserEERCButton() {
    const { address, chainId } = useAccount();
    const { data: client } = useConnectorClient<Config>({ chainId });
    const { writeContractAsync } = useWriteContract();

    async function handleRegister() {
        try {
            if (!address || !chainId) {
                toast.error("Please connect wallet to register");
                return;
            }

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

            toast.warning("Getting proof and signals");
            const registrationHash = user.genRegistrationHash(BigInt(chainId));
            const input = {
                SenderPrivateKey: user.formattedPrivateKey,
                SenderPublicKey: user.publicKey,
                SenderAddress: BigInt(user.signer.address),
                ChainID: chainId,
                RegistrationHash: registrationHash,
            };

            const { proof, publicSignals } = await groth16.fullProve(
                input,
                "/RegistrationCircuit.wasm",
                "/RegistrationCircuit.groth16.zkey");

            console.log(publicSignals);
            console.log(proof);

            toast.info("Calling the contract");
            let a = proof.pi_a.slice(0, 2);
            let proofa = a.map((i) => BigInt(i));

            let c = proof.pi_c.slice(0, 2);
            let proofc = c.map((i) => BigInt(i));

            let b = proof.pi_b.slice(0, 2);
            let shortB = b.map((i) => i.slice(0, 2));
            let proofb = shortB.map((i) => i.map((j)=> BigInt(j)));

            console.log("Error signatures");
            //  0x09bde339
            console.log(utils.sha3("InvalidSender()"));
            console.log(utils.sha3("InvalidChainId()"));
            console.log(utils.sha3("InvalidRegistrationHash()"));
            console.log(utils.sha3("UserAlreadyRegistered()"));
            console.log(utils.sha3("InvalidProof()"));

            const txHash = await writeContractAsync({
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
                        publicSignals: publicSignals
                    }
                ],
            });
            console.log("Transaction hash", txHash);

            toast.success("Registered succesfully");
        } catch (err) {
            console.error("Error registering", err);
        }
    }

    return (
        <Button
            onClick={handleRegister}
        >
            Register EERC
        </Button>
    );
}