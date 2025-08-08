import { toast } from "sonner";
import { Button } from "../ui/button";
import {groth16} from "snarkjs";
import { useAccount, useConnectorClient, type Config } from "wagmi";
import { JsonRpcProvider } from 'ethers'
import { User } from "@/eerc/user";

export default function RegiserEERCButton() {
    const { address, chainId } = useAccount();
    const { data: client } = useConnectorClient<Config>({ chainId });
    async function handleRegister() {
        try {
            if (!address || !chainId) {
                toast.error("Please connect wallet to register");
                return;
            }

            toast.warning("Beginning register process");

            toast.warning("Getting account details");
            if (!client) {
                toast.error("Could not get client");
                return;
            }

            const { account, chain, transport } = client
            const network = {
                chainId: chain.id,
                name: chain.name,
                ensAddress: chain.contracts?.ensRegistry?.address,
            }

            toast.warning("Getting user");
            const provider = new JsonRpcProvider(transport.url, network);
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
                { secret: 12345 },
                "/RegistrationCircuit.wasm",
                "/RegistrationCircuit.groth16.zkey");
            console.log(publicSignals);
            console.log(proof);

            console.log(proof, publicSignals);

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