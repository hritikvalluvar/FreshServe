import { z } from "zod";

export const orderFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  address: z.string().min(1, "Address is required").max(20, "Address must be 20 characters or less"),
  area: z.enum(["NT", "OT", "KK"], { message: "Select a valid area" }),
  phone_number: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  items: z.array(
    z.object({
      product_id: z.number(),
      quantity: z.number().positive(),
    })
  ).min(1, "At least one item is required"),
});

export const shopActionSchema = z.object({
  action: z.enum(["open_shop", "close_shop", "close_gate"]),
  order_date: z.string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        if (isNaN(date.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      { message: "Order date must be a valid future date" }
    ),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;
export type ShopAction = z.infer<typeof shopActionSchema>;
