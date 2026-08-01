import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import placeOrderTool from "./tools/place-order";
import listMyOrdersTool from "./tools/list-my-orders";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "hikah-groceries-hub",
  title: "HIKAH Groceries Hub",
  version: "0.1.0",
  instructions:
    "Tools for the HIKMAH grocery shop. Use `list_products` to browse the catalogue and current PKR prices, `place_order` to place a delivery order for the signed-in user (item names must match product names exactly), and `list_my_orders` to review that user's own past orders.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProductsTool, placeOrderTool, listMyOrdersTool],
});