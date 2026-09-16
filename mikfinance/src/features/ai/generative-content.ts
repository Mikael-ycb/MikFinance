"use server";

import { Transaction } from "@/app/types/transaction";
import { findEmbedding } from "./embedding";
import { createAI } from "./instance";

export async function generateChart(request: string) {
  const ai = createAI();

  const data = await findEmbedding(request, 0.5, 50);

  let contextData = "";
  if (!data || data.lenght === 0) {
    contextData =
      "No transaction found that are simmilar or relevant to the request";
  } else {
    contextData = data
      .map((transaction: Transaction) => {
        return JSON.stringify(transaction);
      })
      .join("\n");
  }

  const contents = {
    role: "user",
    parts: [
      {
        text: `
            <role>
            You are an AI Financial Advisor and data engineering specialist. Your task is to analyze transaction in <context> and generatea structured JSON configuration to render charts that derectly response the user's request.
            </role>
            <input>
            User Question: "${query}"
            </input>
            <instruction>
            - Extract the transaction details from the input.
            - Answer the user question ONLY based on the relevant transaction data (if there's need data).
            - If there are calculations (total spending, average, etc), calculate them accurately based on data.
            - Provide the answer in a neat, professional, yet eazy-to-understand markdown format.
            - If there is no relevant data at all, state that data is not avaible in the history.
            - If user question is general and not need a data, response generally.
            - The final response if there are no more functions being called is as simple as possible.
            </instruction>
            <context>
            Current Date : ${new Date().toISOString()}
            </context>
            <constraints>
            - Answer in relaxed, polite but professional in Indonesia.
            - Don't make assumptions about data from users if they don't mention it.
            - If there are quetions outside the context related to finance, you most only answer questions related to finance.
            - Don't answer in table format instead of markdown.
            </constraints>
            `,
      },
    ],
  };
}
