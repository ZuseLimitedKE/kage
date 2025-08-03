import z from "zod";

export const OrdersSchema = z.object({
  order_type: z.enum(["buy", "sell"], { error: "invalid order type selected" }),
  amount: z
    .number({ error: "amount must be a valid number" })
    .nonnegative({ error: "the amount cannot be negative" }),
  rate: z
    .number({ error: "rate must be a valid number" })
    .nonnegative({ error: "rate must be positive" }),
});

export type CreateOrder = z.infer<typeof OrdersSchema>;
