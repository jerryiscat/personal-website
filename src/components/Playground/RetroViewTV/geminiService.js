// Note: This requires an API key to be set in environment variables
// For now, we'll return mock data if no API key is available

const getClient = () => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API key not found. Using mock data.");
    return null;
  }
  
  try {
    const { GoogleGenAI } = require('@google/genai');
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Failed to initialize Gemini client:", error);
    return null;
  }
};

// Mock data generator
const generateMockMovie = (genre) => {
  const mockMovies = {
    'Sci-Fi': {
      title: 'Cosmic Drifters',
      year: '1987',
      director: 'Dr. Zephyr Nova',
      plot: 'In a distant future, space explorers discover a planet where time moves backwards. They must race against reverse entropy to save their home world.',
      tagline: 'Time is running out... backwards!',
      rating: '4.5/5',
    },
    'Noir': {
      title: 'Shadows in the Rain',
      year: '1974',
      director: 'Max Blackwood',
      plot: 'A private detective gets entangled in a web of corruption when a mysterious woman hires him to find her missing husband.',
      tagline: 'In the city of lies, truth is the deadliest weapon.',
      rating: '4.7/5',
    },
    'Western': {
      title: 'Dust & Glory',
      year: '1982',
      director: 'Clint Rivers',
      plot: 'A retired gunslinger must return to his violent past when bandits threaten the small town that gave him peace.',
      tagline: 'Some men can never hang up their guns.',
      rating: '4.3/5',
    },
    'Horror': {
      title: 'The Whispering Walls',
      year: '1979',
      director: 'Victoria Graves',
      plot: 'A family moves into an old mansion where the walls literally speak, revealing the dark secrets of previous tenants.',
      tagline: 'The house remembers... and it wants revenge.',
      rating: '4.6/5',
    },
    'Rom-Com': {
      title: 'Love in Transit',
      year: '1991',
      director: 'Penny Heart',
      plot: 'Two strangers keep missing each other on the same subway line, until fate finally brings them together.',
      tagline: 'Sometimes the best love stories start with a missed connection.',
      rating: '4.4/5',
    },
    'Kung Fu': {
      title: 'Dragon\'s Path',
      year: '1985',
      director: 'Master Chen',
      plot: 'A young martial artist must master the ancient Dragon Style to defeat an evil warlord threatening his village.',
      tagline: 'The way of the dragon is the path to honor.',
      rating: '4.8/5',
    },
  };

  return mockMovies[genre] || mockMovies['Sci-Fi'];
};

export const generateMovieInfo = async (genre) => {
  const ai = getClient();
  
  if (!ai) {
    // Return mock data
    const mockData = generateMockMovie(genre);
    return {
      ...mockData,
      genre,
      posterPrompt: `Vintage ${genre} movie poster from the ${mockData.year}s, painted style, distressed texture, dramatic lighting`,
    };
  }

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
    const { Type } = require('@google/genai');
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
    // Fallback to mock data
    const mockData = generateMockMovie(genre);
    return {
      ...mockData,
      genre,
      posterPrompt: `Vintage ${genre} movie poster from the ${mockData.year}s, painted style, distressed texture`,
    };
  }
};

export const generateMoviePoster = async (prompt) => {
  const ai = getClient();
  
  if (!ai) {
    // Return a placeholder or null
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating poster:", error);
    return null;
  }
};

