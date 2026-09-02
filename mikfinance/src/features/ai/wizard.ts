import z from "zod";
import { createAI } from "./instance";
import { FunctionDeclaration, Type } from "@google/genai";

const transactionSchema = z.object({
  amount: z.number().default(0).describe("Transaction nominal"),
  type: z.enum(["income", "expense"]).describe("Type of transaction"),
  category: z
    .enum(["Food & Drink", "Transport", "Reword", "Salary", "Invest", "Others"])
    .describe("Category of Transaction"),

  description: z.string().describe("Short text for describing transaction"),
  date: z.string().describe("the date of transaction in YYYY-MM-DD"),
});

export async function handleWizardInput(message: string) {
  const contents = `
  <role>
    You are an AI Wizard finance assistant, who can extract transaction details from text.
  </role>
  <instruction>
  Extract the transaction detail from the following text and return it as a structure JSON object.
  The JSON object must have exactly these fields:
  - "amount": a number representing the cost (positive). Use 0 if not provided.
  - "type": type of transaction, either 'income' or 'expense'.
  - "category": chose the most appropriate category from this exact list:
          "Food & Drink", "Transport", "Reword", "Salary", "Invest", "Others".
  - "description" : a short string descripting the transaction, first letter capitalized.
  - "date": date of transaction in YYY-MM-DD format.
            Assume the current date if relative term like 'today' or 'just now'. If not define use current date.
  </instruction>
  <context>
    Current Date:  ${new Date().toISOString()}
  </context>
  <input>
      Text to extract: ${message}
  </input>
  <outputFormat>
    Respond with only the raw JSON object, no markdown clocks, no text before or after.
  </outputFormat>
  ${message}`;
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: z.toJSONSchema(transactionSchema),
    },
  });

  const transaction = transactionSchema.parse(JSON.parse(`${response.text}`));
  if (transaction.amount <= 0) {
    throw new Error("Cannot create transaction with invalid amount");
  }
  return transaction;
}

const createTransactionDeclaration: FunctionDeclaration = {
  name: "create_transaction",
  description:
    "Create a new transaction in the user's financial history based on the provided details.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      amount: {
        type: Type.STRING,
        description: "The amounth of the transaction",
      },
      type: {
        type: Type.STRING,
        enum: ["income", "expense"],
        description: "The type the transaction, either  'income' or 'expense'",
      },
      category: {
        type: Type.STRING,
        enum: [
          "Food & Drink",
          "Transport",
          "Reword",
          "Salary",
          "Invest",
          "Others",
        ],
        description: "The Category of the transaction",
      },
      description: {
        type: Type.STRING,
        description: "A brief description of the transaction",
      },
      date: {
        type: Type.STRING,
        description: 'The date of the transaction in the format "YYYY-MM-DD"',
      },
    },
    required: ["amount", "description", "type", "category", "date"],
  },
};
