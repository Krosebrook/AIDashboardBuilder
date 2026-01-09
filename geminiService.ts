
import { GoogleGenAI, Type } from "@google/genai";
import { DashboardData } from "./types";

/**
 * Simplified initialization following @google/genai guidelines.
 * Creates a new instance to ensure the latest environment config is used.
 */
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const WIDGET_ENUM = ['stat', 'line-chart', 'bar-chart', 'pie-chart', 'area-chart', 'scatter-plot'];

const WIDGET_PROPERTIES = {
  id: { type: Type.STRING },
  type: { type: Type.STRING, enum: WIDGET_ENUM },
  title: { type: Type.STRING },
  value: { type: Type.STRING },
  unit: { type: Type.STRING },
  trend: {
    type: Type.OBJECT,
    properties: {
      value: { type: Type.NUMBER },
      isUpward: { type: Type.BOOLEAN }
    },
    required: ['value', 'isUpward']
  },
  chartData: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        value: { type: Type.NUMBER },
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER }
      }
    }
  },
  color: { type: Type.STRING }
};

// Use gemini-3-pro-preview for complex coding/logic tasks like JSON schema generation
export const generateDashboardSchema = async (userPrompt: string): Promise<DashboardData> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a dashboard schema based on this request: "${userPrompt}". 
    Create between 4 to 8 widgets including stats and charts (line-chart, bar-chart, pie-chart, area-chart, scatter-plot). 
    For scatter-plots, ensure chartData has numeric 'x' and 'y' properties for coordinates.
    Provide realistic sample data for charts.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          themeColor: { type: Type.STRING, description: "A hex color code for the main brand color" },
          widgets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: WIDGET_PROPERTIES,
              required: ['id', 'type', 'title']
            }
          }
        },
        required: ['title', 'description', 'widgets', 'themeColor']
      }
    }
  });

  if (!response.text) throw new Error("No response from AI");
  
  try {
    return JSON.parse(response.text.trim()) as DashboardData;
  } catch (err) {
    console.error("AI response parse error:", err, response.text);
    throw new Error("The AI returned an invalid dashboard configuration.");
  }
};

// Use gemini-3-pro-preview for complex updates
export const updateDashboardSchema = async (currentData: DashboardData, command: string): Promise<DashboardData> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are an expert Dashboard Engineer. 
    Current Dashboard JSON: ${JSON.stringify(currentData)}
    
    User Command: "${command}"
    
    Modify the dashboard according to the user command. You can add, remove, or modify widgets, change themes, or update data. 
    Supported charts: line-chart, bar-chart, pie-chart, area-chart, scatter-plot.
    Maintain the JSON structure. Return the FULL updated JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          themeColor: { type: Type.STRING },
          widgets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: WIDGET_PROPERTIES,
              required: ['id', 'type', 'title']
            }
          }
        },
        required: ['title', 'description', 'widgets', 'themeColor']
      }
    }
  });

  if (!response.text) throw new Error("No response from AI");
  
  try {
    return JSON.parse(response.text.trim()) as DashboardData;
  } catch (err) {
    console.error("AI response update parse error:", err, response.text);
    throw new Error("The AI returned an invalid updated dashboard configuration.");
  }
};
