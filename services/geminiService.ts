import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MedicalAnalysis } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for the structured output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    reportType: { type: Type.STRING, description: "Type of the report, e.g., 'CBC Blood Test', 'Lipid Profile', 'MRI Scan'" },
    summary: { type: Type.STRING, description: "A friendly, easy-to-understand summary of the overall health status based on the report." },
    parameters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.STRING },
          unit: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["Normal", "Abnormal", "Critical", "Unknown"] },
          referenceRange: { type: Type.STRING },
          explanation: { type: Type.STRING, description: "What does this test measure in simple terms?" },
          implication: { type: Type.STRING, description: "What does this specific result mean for the patient?" },
        },
        required: ["name", "value", "status", "explanation", "implication"],
      },
    },
    redFlags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of critical or high-risk findings that need immediate attention. Be calm but clear.",
    },
    lifestyleRecommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Simple lifestyle, diet, or monitoring suggestions based on the results.",
    },
    disclaimer: { type: Type.STRING, description: "Standard medical disclaimer." },
  },
  required: ["reportType", "summary", "parameters", "redFlags", "lifestyleRecommendations", "disclaimer"],
};

export const analyzeMedicalReport = async (base64Image: string): Promise<MedicalAnalysis> => {
  try {
    const modelId = "gemini-2.5-flash"; // Using 2.5 Flash for speed and multimodal capabilities

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming JPEG for simplicity, can be dynamic
              data: base64Image,
            },
          },
          {
            text: `You are MediGuide AI, a helpful medical assistant. 
            Analyze this medical report image. 
            Extract the data and provide a simplified explanation for a patient who is not a doctor.
            Identify the test type, key values, normal ranges, and status.
            Highlight any red flags calmly.
            Provide general lifestyle recommendations.
            ALWAYS include a disclaimer that this is AI-generated and not a replacement for a doctor.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, // Low temperature for factual accuracy
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as MedicalAnalysis;
    }
    throw new Error("No response text generated");

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const askFollowUpQuestion = async (
  context: MedicalAnalysis,
  history: { role: string; text: string }[],
  question: string
): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash";
    
    // Construct a context-aware prompt
    const contextString = `
      Context (Medical Report Analysis):
      Report Type: ${context.reportType}
      Summary: ${context.summary}
      Key Abnormalities: ${context.redFlags.join(", ")}
    `;

    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: `You are MediGuide AI. You have analyzed a patient's medical report. 
        Answer their follow-up questions clearly, empathetically, and simply. 
        Do not give specific medical prescriptions (drug names/dosages). 
        Always advise consulting their doctor for specific treatment.
        Context: ${contextString}`,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: question });
    return result.text || "I'm sorry, I couldn't process that question right now.";

  } catch (error) {
    console.error("Chat failed:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again.";
  }
};