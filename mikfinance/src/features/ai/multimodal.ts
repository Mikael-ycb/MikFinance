import {
  CATEGORIES,
  transactionSchema,
} from "@/constants/transaction-constant";
import { createAI } from "./instance";
import { Content } from "@google/genai";

export async function extractReceiptData(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No File Uploaded");
  }

  const mimeType = file.type;
  const base64Data = Buffer.from(await file.arrayBuffer()).toString("base64");
  const ai = createAI();
  const contents: Content[] = [
    {
      role: "user",
      parts: [
        {
          text: `
        <role>
        You are an AI finance assistant who extracts transaction details from receipts.
        </role>

        <instruction>
        Extract the transaction details from the receipt and return them as a JSON object.

        The JSON object must contain exactly these fields:

        - "amount": a positive number representing the transaction amount.
        - "type": either "income" or "expense".
        - "category": choose the most appropriate category from:
        ${CATEGORIES.join(", ")}
        - "description": a short description of the transaction with the first letter capitalized.
        - "date": transaction date in YYYY-MM-DD format.

        If the date cannot be found, use today's date.

        Current date:
        ${new Date().toISOString()}
        </instruction>
          `,
        },
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents,
  });

  if (!response.text) {
    throw new Error("AI cannot generate data");
  }

  const transaction = transactionSchema.parse(JSON.parse(`${response.text}`));

  return transaction;
}
