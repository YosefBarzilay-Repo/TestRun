import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// Initialize safe client
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeFailure = async (testName: string, errorLog: string): Promise<string> => {
  if (!ai) {
    return "API Key not configured. Unable to analyze failure.";
  }

  try {
    const prompt = `
      You are a Senior QA Automation Engineer. Analyze the following test failure and provide a concise summary of the root cause and a suggested fix.
      
      Test Name: ${testName}
      Error Log:
      ${errorLog}
      
      Output format:
      **Root Cause:** [Explanation]
      **Suggested Fix:** [Actionable steps]
      **Pattern:** [Is this likely a flake, bug, or environment issue?]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Speed over deep thought for this simple task
      }
    });

    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Error analyzing failure. Please try again later.";
  }
};
