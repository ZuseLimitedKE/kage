import { toast } from "sonner";
import { Button } from "../ui/button";

export default function RegiserEERCButton() {
    function handleRegister() {
        try {   
            toast.warning("Beginning register process");
            toast.success("Registered succesfully");
        } catch(err) {
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