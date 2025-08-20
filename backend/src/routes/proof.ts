import { Router } from "express";
import { Errors } from "../constants/errors";
import { generateProofSchema } from "../types";
import * as snarkjs from "snarkjs";
const router: Router = Router();
import path from "path";

router.get("/", (req, res) => {
    res.send("Anthony is bust");
})

router.post("/", async (req, res) => {
    try {
        console.log(req.body);
        const parsed = generateProofSchema.safeParse(req.body);
        if (parsed.success) {
            const input = parsed.data;
            const zkeyPath = path.join(process.cwd(), "circuits/build/registration_key.zkey");
            const wasmPath = path.join(process.cwd(), "circuits/build/registration_js/registration.wasm");
            const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
            res.status(201).json({
                proof,
                publicSignals,
            });
        }
    } catch (err) {
        console.log("Error generating proof", err);
        res.status(500).json({ message: Errors.INTERNAL_SERVER_ERROR });
    }
});
export default router;