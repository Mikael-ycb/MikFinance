"use server";

import { Conversation } from "@/app/types/ai";
import { createAI } from "./instance";
import z from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "./embedding";
import { Transaction } from "@/app/types/transaction";

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

async function generalChat(conversation: Conversation[], isThinking?: boolean) {
  const ai = createAI();
  const response = await ai.models.generateContentStream({
    model: "gemini-3.6-flash",
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

async function personalizedChat(
  query: string,
  historyChat?: Conversation[],
  isThinking?: boolean,
) {
  const ai = createAI();

  const supabase = await createClient();

  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc("match_transactions", {
    query_embedding: queryEmbedding,
    match_threshold: 0.3,
    match_count: 15,
  });

  if (error) {
    console.error("Vector search error:", error);
    throw new Error(`Vector search failed: ${error.message}`);
  }

  let contextData = "";

  if (!data || data.length === 0) {
    contextData =
      "No Transactions found that are similar or relevant to the question";
  } else {
    contextData = data
      .map((transaction: Transaction) => {
        return JSON.stringify(transaction);
      })
      .join("\n");
  }

  const prompt = `
<role>
  You are an AI Financial Advisor.

  You are helping the user analyze their finance data using
  the RAG (Retrieval-Augmented Generation) technique.
</role>
<input>
  User Question: "${query}"
</input>
<context>
Relevant Transaction data from the database (Ordered from most relevant):
${contextData}
</context>
<instruction>
- Answer the user question ONLY based on the relevant transaction data above.
- If there are calculations (total spending, average, etc), calculate them accurately based on data.
- Provide the answer in a neat, professional, yet eazy-to-understand markdown format.
- If there is no relevant data at all, state that data is not avaible in the history.
- If user question is general and not need a data, response generally.
</instruction>
<constraints>
- Don't answer in table format instead of markdown.
</constraints>
`;

  const response = await ai.models.generateContentStream({
    model: "gemini-3.6-flash",
    contents: [
      ...(historyChat ?? []),
      { role: "user", parts: [{ text: prompt }] },
    ],
    config: {
      thinkingConfig: {
        includeThoughts: isThinking,
      },
    },
  });

  return response;
}

export async function* handleChatStreaming(
  conversation: Conversation[],
  isThinking: boolean,
  mode: "general" | "personal",
) {
  let response;
  if (mode === "general") {
    response = await generalChat(conversation, isThinking);
  } else {
    response = await personalizedChat(
      conversation[conversation.length - 1].parts[0].text,
      conversation.slice(0, -1),
      isThinking,
    );
  }
  if (isThinking) {
    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (!part.text) {
            continue;
          } else if (part.thought) {
            yield `[thounght]${part.text}`;
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
}
