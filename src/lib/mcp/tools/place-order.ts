import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "place_order",
  title: "Place an order",
  description:
    "Place a grocery order for the signed-in user. Item names must match product names exactly (use list_products first). The total is always recalculated from current shop prices.",
  inputSchema: {
    customer_name: z.string().describe("Name of the person receiving the delivery."),
    phone: z.string().describe("Contact phone number for the delivery."),
    address: z.string().describe("Full delivery address."),
    payment_method: z
      .string()
      .describe("Either 'Cash on Delivery' or 'Online Payment'."),
    items: z
      .array(
        z.object({
          name: z.string().describe("Exact product name."),
          quantity: z.number().describe("Quantity in product units."),
        }),
      )
      .describe("Products to order."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ customer_name, phone, address, payment_method, items }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.rpc("create_order_authed", {
      _customer_name: customer_name,
      _phone: phone,
      _address: address,
      _items: items,
      _payment_method: payment_method,
    });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Order placed. Order id: ${data}` }],
      structuredContent: { order_id: data },
    };
  },
});