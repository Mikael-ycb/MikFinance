import z from "zod";

export const CATEGORIES = [
  "Food & Drink",
  "Transport",
  "Reword",
  "Salary",
  "Invest",
  "Others",
];

export const transactionSchema = z.object({
  amount: z.number().default(0).describe("Transaction nominal"),
  type: z.enum(["income", "expense"]).describe("Type of transaction"),
  category: z.enum(CATEGORIES).describe("Category of Transaction"),

  description: z.string().describe("Short text for describing transaction"),
  date: z.string().describe("the date of transaction in YYYY-MM-DD"),
});
