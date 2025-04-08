import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODEL_NAME = "gemini-2.0-flash"; // Or another suitable model

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment variables.");
  }
  return apiKey;
}

const genAI = new GoogleGenerativeAI(getApiKey());
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
  temperature: 0.8, // Adjust for creativity vs. predictability
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192, // Adjust based on expected roadmap length
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

interface RoadmapInput {
  discipline: string;
  goals: string;
  interests: string;
  strengths?: string;
  weaknesses?: string;
}

// Define a more structured output type if possible, otherwise use 'any'
export interface RoadmapYear {
  year: number;
  focus: string;
  skills: string[];
  projects: string[];
  courses: string[];
  books: string[];
  networking?: string[];
  internships?: string[];
  routine?: string;
  advice?: string;
}

export interface GeneratedRoadmap {
  years: RoadmapYear[];
  overall_advice?: string;
}


function buildPrompt(input: RoadmapInput): string {
  // Added more explicit instructions for JSON-only output
  return `
Generate a detailed, personalized 4-year career roadmap for an aspiring engineer with the following profile:

**Discipline:** ${input.discipline}
**Career Goals:** ${input.goals}
**Technical Interests:** ${input.interests}
${input.strengths ? `**Strengths:** ${input.strengths}` : ""}
${input.weaknesses ? `**Weaknesses / Areas for Improvement:** ${input.weaknesses}` : ""}

**Instructions:**
1.  Create a year-by-year plan covering 4 years.
2.  For each year, provide specific, actionable advice including:
    *   **Focus:** The main theme or objective for the year.
    *   **Skills:** Key technical and soft skills to develop (list 3-5).
    *   **Projects:** Ideas for personal or academic projects to build skills (list 1-3).
    *   **Courses:** Relevant university courses or online certifications (list 2-4).
    *   **Books:** Foundational or advanced books to read (list 1-3).
    *   **Networking:** Suggestions for connecting with peers and professionals.
    *   **Internships:** When and how to seek internships (especially for years 2-4).
    *   **Routine:** Guidance on daily/weekly study and practice habits.
    *   **Advice:** Any other relevant tips for that year.
3.  Include overall advice applicable throughout the 4 years.
4.  Tailor the roadmap specifically to the provided discipline, goals, and interests. Consider strengths and weaknesses if provided.
5.  **CRITICAL: Output ONLY the raw JSON object.** Do not include markdown formatting like \`\`\`json or any introductory/explanatory text before or after the JSON object. The entire response must be the JSON object itself.
6.  **JSON Structure:** The JSON object MUST strictly follow this structure:
    \`\`\`json
    {
      "years": [
        {
          "year": 1,
          "focus": "...",
          "skills": ["...", "..."],
          "projects": ["...", "..."],
          "courses": ["...", "..."],
          "books": ["...", "..."],
          "networking": ["...", "..."],
          "internships": ["..."],
          "routine": "...",
          "advice": "..."
        },
        // ... years 2, 3, 4
      ],
      "overall_advice": "..."
    }
    \`\`\`
7.  Ensure the JSON is well-formed and complete.
`;
}

// Function to extract JSON from potentially messy LLM output
function extractJson(text: string): string | null {
  // Try finding JSON within markdown code blocks
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  // Try finding JSON starting with '{' and ending with '}'
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch && jsonMatch[0]) {
    return jsonMatch[0].trim();
  }

  // If no clear JSON structure is found, return null
  return null;
}


export async function generateRoadmapWithGemini(input: RoadmapInput): Promise<GeneratedRoadmap | { error: string }> {
  try {
    const prompt = buildPrompt(input);
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    const rawText = response.text();
    console.log("Raw Gemini Response Text:", rawText); // Log the raw response

    // Use the improved extraction function
    const jsonString = extractJson(rawText);

    if (!jsonString) {
      console.error("Could not extract valid JSON from LLM response.");
      console.error("Raw LLM Response:", rawText);
      return { error: "Failed to process the roadmap generated by the AI. The format was invalid or JSON could not be extracted." };
    }

    console.log("Extracted JSON String:", jsonString); // Log the extracted string

    try {
      const roadmap = JSON.parse(jsonString) as GeneratedRoadmap;
      // Basic validation
      if (!roadmap || !Array.isArray(roadmap.years) || roadmap.years.length === 0) {
         console.error("Invalid JSON structure after parsing:", roadmap);
         throw new Error("LLM returned an invalid roadmap structure.");
      }
      // Add more specific checks if needed (e.g., check for year property)
      if (!roadmap.years.every(y => typeof y.year === 'number')) {
        console.error("Invalid year structure in roadmap:", roadmap.years);
        throw new Error("LLM returned roadmap with invalid year structure.");
      }

      return roadmap;
    } catch (parseError) {
      console.error("Failed to parse extracted JSON string:", parseError);
      console.error("Extracted JSON String Attempted:", jsonString);
      console.error("Original Raw LLM Response:", rawText);
      return { error: "Failed to process the roadmap generated by the AI. The format was invalid after extraction." };
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Refine error message based on potential API errors
    if (error instanceof Error && error.message.includes("API key not valid")) {
       return { error: "Invalid Gemini API Key. Please check your .env file." };
    }
    if (error instanceof Error && error.message.includes("SAFETY")) {
       return { error: "The AI response was blocked due to safety settings. Try adjusting your input or the safety thresholds." };
    }
    return { error: "An error occurred while generating the roadmap with the AI." };
  }
}
