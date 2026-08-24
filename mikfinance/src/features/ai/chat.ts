"use server";

import { Conversation } from "@/app/types/ai";
import { Input } from "@/components/ui/input";
import { ENVIRONMENT } from "@/config/environment";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: ENVIRONMENT.googleGenAIKey });

export async function handleChat(
  conversation: Conversation[],
  isThinking: boolean,
) {
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

export async function* handleChatStreaming(
  conversation: Conversation[],
  isThinking: boolean,
) {
  const response = await ai.models.generateContentStream({
    model: "gemini-3.5-flash",
    contents: [...conversation],
    config: {
      thinkingConfig: {
        includeThoughts: isThinking,
        // thinkingLevel: isThinking ? ThinkingLevel.HIGH : ThinkingLevel.MINIMAL,
        // thinkingBudget: isThinking ? -1 : 0,
      },
      systemInstruction: `
        Kamu adalah seorang financial, investasi, dan trading advisor profesional.
        Berikan saran finansial kepada pengguna berdasarkan informasi yang diberikan.

        [Input]
        Pengguna akan menanyakan seputar menabung, investasi, pengelolaan hutang,
        atau pertanyaan lain seputar finance.

        [Constraints]
        - Jika memberikan saran diakhiri jawaban tulis kalimat disclaimer "Saran ini bersifat edukasi, keputusan ada di tangan anda."
        - Jawab dengan bahasa indonesia yang santai, sopan namun tetap profesional.
        - Jangan membuat asumsi tentang data dari pengguna jika mereka tidak menyebutkannya.
        - Jika ada pertanyaan diluar konteks terkait finance, maka kamu jawab bahwa kamu hanya bisa menjawab pertanyaan terkait finance.
        
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
      maxOutputTokens: 1024,
      stopSequences: ["\n\n\n", "###", "User:", "Pengguna:"],
      //repetition penalties
      // presencePenalty:1.5,
      // frequencyPenalty:1.5,
    },
  });

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
