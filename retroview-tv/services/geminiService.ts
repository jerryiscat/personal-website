import { GoogleGenAI, Type } from "@google/genai";
import { MovieData } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please ensure process.env.API_KEY is set.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMovieInfo = async (genre: string): Promise<MovieData> => {
  const ai = getClient();
  
  const prompt = `
    Create a fictional, cult-classic vintage movie entry from the 1970s, 80s, or 90s based on the genre: "${genre}".
    Be creative, funny, or dramatic. 
    Return a JSON object with the following fields:
    - title: The name of the movie (make it sound vintage).
    - year: A year between 1970 and 1999.
    - director: A fictional director name.
    - plot: A short, engaging 2-3 sentence plot summary.
    - tagline: A cheesy or dramatic tagline.
    - rating: A star rating (e.g., "4.5/5").
    - posterPrompt: A highly descriptive visual prompt to generate a vintage movie poster for this film. Include style details like "painted style, 80s movie poster, distressed texture".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            year: { type: Type.STRING },
            director: { type: Type.STRING },
            plot: { type: Type.STRING },
            tagline: { type: Type.STRING },
            rating: { type: Type.STRING },
            posterPrompt: { type: Type.STRING },
          },
          required: ["title", "year", "director", "plot", "tagline", "rating", "posterPrompt"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No text returned from Gemini");
    }

    const data = JSON.parse(response.text);
    return { ...data, genre };
  } catch (error) {
    console.error("Error generating movie info:", error);
    throw error;
  }
};

export const generateMoviePoster = async (prompt: string): Promise<string | undefined> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4", // Classic poster ratio
        }
      }
    });

    // Iterate through parts to find the image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Error generating poster:", error);
    // Fail gracefully without breaking the whole app
    return undefined;
  }
};
