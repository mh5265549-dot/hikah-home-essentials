import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List the shop's grocery products with current prices in PKR. Optionally filter by category or search by name.",
  inputSchema: {
    category: z.string().optional().describe("Category id, e.g. staples, dairy, fruits."),
    search: z.string().optional().describe("Case-insensitive product name search."),
    limit: z.number().int().optional().describe("Maximum rows to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("products")
      .select("id, name, price, category, unit, seasonal, season_label")
      .order("category");
    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);
    query = query.limit(Math.min(Math.max(limit ?? 50, 1), 200));

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { products: data ?? [] },
    };
  },
});