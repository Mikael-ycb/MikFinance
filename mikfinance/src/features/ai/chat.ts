"use server";

import { Conversation } from "@/app/types/ai";
import { createAI } from "./instance";
import { findEmbedding } from "./embedding";
import { Content, FunctionCall, Part } from "@google/genai";
import { getTransactionDeclaration } from "./functionTransaction";

export async function handleChat(
  conversation: Conversation[],
  isThinking: boolean,
) {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: [...conversation],
    config: {
      thinkingConfig: {
        includeThoughts: isThinking,
      },
    },
  });

  const result = {
    thought: "",
    answer: "",
  };

  if (isThinking) {
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      return;
    }

    for (const part of parts) {
      if (!part.text) {
        continue;
      } else if (part.thought) {
        result.thought += part.text;
      } else {
        result.answer += part.text;
      }
    }
  } else {
    result.answer = `${response.text}`;
  }

  return result;
}

async function generalChat(conversation: Content[], isThinking?: boolean) {
  const ai = createAI();
  const response = await ai.models.generateContentStream({
    model: "gemini-3.7-flash",
    contents: [...conversation],
    config: {
      thinkingConfig: {
        includeThoughts: isThinking,
        // thinkingLevel: isThinking ? ThinkingLevel.HIGH : ThinkingLevel.MINIMAL,
        // thinkingBudget: isThinking ? -1 : 0,
      },
      systemInstruction: `

      [Role]
        Kamu bernama Mik dan kamu adalah seorang financial, investasi, dan trading advisor profesional.
        Berikan saran finansial kepada pengguna berdasarkan informasi yang diberikan. kamu juga suka memberikan contoh penerapan finansial berdasarkan analogi kehidupan sehari-hari.

        [Context]
        kamu berkerja untuk MikFinance, platform financial tracker yang target utama adalah gen Z indonesia (usia 18-30 tahun). Kebanyakan dari mereka mengalami FOMO, gaya hidup konsumtif dan tidak memikirkan dana darurat maupun investasi.
        
        [Instruction]
        - Jawab semua pertanyaan yang sesuai dengan bidang finance and Investment

        [Input]
        Pengguna akan menanyakan seputar menabung, investasi, pengelolaan hutang,
        atau pertanyaan lain seputar finance.

        [Constraints]
        - Jika memberikan saran diakhiri jawaban tulis kalimat disclaimer "Saran ini bersifat edukasi, keputusan ada di tangan anda."
        - Jawab dengan bahasa indonesia yang santai, sopan namun tetap profesional.
        - Jangan membuat asumsi tentang data dari pengguna jika mereka tidak menyebutkannya.
        - Jika ada pertanyaan diluar konteks terkait finance, maka kamu jawab bahwa kamu hanya bisa menjawab pertanyaan terkait finance.
        
        [WOrkflow Steps]
        - Langkah 1 (Information Extraction): identifikasi pengguna, tanyakan usia, peghasilan/buget, tujuan keuangannya
        - Langkah 2 (Thounght): analisis masalah utama pengguna dan data apa yang kurang.
        - Langkah 3 (Action): tentukan rencana yang harus dijalankan
        - Langkah 4 (Evaluation): Periksa kembali hasil dari action.
        - Langkah 5 (Response Generation): Keluarkan jawaban akhir ke pengguna

        [Response Format]
        Struktur jawaban kamu harus seperti ini:
        1. sapaan ramah.
        2. Analisis singkat masalah pengguna dalam 1 kalimat.
        3. langkah solusi menggunakan bullet points.
        
        [Example]
        ikuti gaya jawaban dari contoh berikut:
        [Contoh 1]
        user: "Gaji saya 5 juta, bagaimana cara nabung dana darurat"
        Model: "mengumpulkan dana darurat dengan gaji 5 juta itu sangat mungkin asalkan konsisten."
        Berikut langkah awalnya:
        - Sisihkan minimal 10% diawal bulan.
        - Simpan di instrumen rendah resiko seperti RDPU

        [Contoh 2]
        User: "mending bayar hutang atau mulai berinvestasi"
        Model: "Prioritas utama yang paling sehat adalah melunasi hutang konsumtif dengan bunga tinggi.
        Ini saran untukmu:
        - Stop menggunakan paylater untuk sementara waktu.
        - Dana berlebih pakai untuk melunasi hutang tersebut karena bunga jauh lebih tinggi dari imbal hasil investasi.
        - setelah lunas baru mulai investasi secara bertahap dan konsisten
        "
        `,
      // sampling params
      temperature: 0.2,
      topK: 5,
      topP: 0.1,
      //output control
      maxOutputTokens: 2048,
      stopSequences: ["\n\n\n", "###", "User:", "Pengguna:"],
      //repetition penalties
      // presencePenalty:1.5,
      // frequencyPenalty:1.5,
    },
  });

  return response;
}

export async function* handleChatStreaming(
  conversation: Content[],
  isThinking: boolean,
  mode: "general" | "personal",
) {
  if (mode === "general") {
    const response = await generalChat(conversation, isThinking);
    if (isThinking) {
      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (!part.text) {
              continue;
            } else if (part.thought) {
              return `[thounght]${part.text}`;
            } else {
              yield part.text;
            }
          }
        }
      }
    } else {
      for await (const chunk of response) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    }
  } else {
    const query = conversation[conversation.length - 1].parts?.[0].text;
    const historyChat = conversation.slice(0, -1);

    const ai = createAI();

    let contents: Content[] = [
      ...historyChat,
      {
        role: "user",
        parts: [
          {
            text: `
<role>
  You are an AI Financial Advisor. You are helping the user analyze their finance data.
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
      },
    ];

    let running = true;

    while (running) {
      const response = await ai.models.generateContentStream({
        model: "gemini-3.6-flash",
        contents,
        config: {
          tools: [{ functionDeclarations: [getTransactionDeclaration] }],
          thinkingConfig: {
            includeThoughts: isThinking,
          },
        },
      });

      const modelParts: Part[] = [];
      const functionCalls: FunctionCall[] = [];

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts || [];
        if (parts) {
          for (const part of parts) {
            modelParts.push(part);
            if (part.functionCall) {
              functionCalls.push(part.functionCall);
            } else if (part.text) {
              if (part.thought) {
                if (isThinking) yield `[thounght]${part.text}`;
              } else {
                yield part.text;
              }
            }
          }
        }
      }

      if (functionCalls.length > 0) {
        contents.push({ role: "model", parts: modelParts });

        const functionResponseParts = await Promise.all(
          functionCalls.map(async (functionCall) => {
            const { name, args, id } = functionCall;
            if (!args) {
              throw new Error("No arguments provided for Action");
            }

            let resultData = {};

            switch (name) {
              case "get_transaction":
                const dataFind = await findEmbedding(
                  JSON.stringify(args),
                  0.3,
                  100,
                );
                resultData = dataFind || [];
                break;

              default:
                throw new Error("Unknow function call");
            }

            return {
              functionResponse: {
                name,
                response: { result: resultData },
                id,
              },
            };
          }),
        );
        contents.push({
          role: "user",
          parts: functionResponseParts,
        });
      } else {
        running = false;
      }
    }
  }
}
