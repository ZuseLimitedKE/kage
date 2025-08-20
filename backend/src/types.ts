import {z} from "zod";

export const generateProofSchema = z.object({
    SenderPrivateKey: z.string().transform((arg) => BigInt(arg)),
    SenderPublicKey: z.array(z.string().transform((arg) => BigInt(arg))),
    SenderAddress: z.string().transform((arg) => BigInt(arg)),
    ChainID: z.number().transform((arg) => BigInt(arg)),
    RegistrationHash: z.string().transform((arg) => BigInt(arg)),
})