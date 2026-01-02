
import { GoogleGenAI, Type } from "@google/genai";
import { BiologyTheme, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchQuestions(theme: BiologyTheme): Promise<Question[]> {
  const prompt = `
    Je bent een biologie docent voor Havo 5. Genereer 5 unieke vragen voor het spel '6 seconden'. 
    Het thema is: ${theme}.
    De methode is 'Biologie voor jou MAX'.
    Elke vraag MOET beginnen met "Noem 3..." 
    De antwoorden moeten haalbaar zijn binnen 6 seconden voor een goede Havo 5 leerling.
    
    Voorbeelden:
    - Noem 3 organellen in een plantencel.
    - Noem 3 basenparen in DNA.
    - Noem 3 onderdelen van de natuurwetenschappelijke methode.
    - Noem 3 fasen van de celcyclus.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              content: {
                type: Type.STRING,
                description: "De vraag die begint met 'Noem 3...'",
              }
            },
            required: ["content"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, index: number) => ({
      id: `${theme}-${Date.now()}-${index}`,
      theme,
      content: item.content,
    }));
  } catch (error) {
    console.error("Fout bij het ophalen van vragen:", error);
    // Fallback voor demo-doeleinden als de API faalt
    return [
      { id: '1', theme, content: 'Noem 3 organellen van een cel.' },
      { id: '2', theme, content: 'Noem 3 typen eiwitten.' },
      { id: '3', theme, content: 'Noem 3 stappen in de osmose.' }
    ];
  }
}
