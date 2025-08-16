import { toast } from "sonner";
import { Button } from "../ui/button";
import registerABI from "@/registrarABI.json";
import { useReadContract } from "wagmi";

export default function RegisterButton() {
    async function handleRegister() {
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
            //
            // TODO: Generate registration hash using poseidon
            //
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
        <Button onClick={handleRegister}>
            Register to contract
        </Button>
    );
}
