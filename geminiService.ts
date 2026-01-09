
import { GoogleGenAI, Type } from "@google/genai";
import { DashboardData } from "./types";

// Always use the process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDashboardSchema = async (userPrompt: string): Promise<DashboardData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a dashboard schema based on this request: "${userPrompt}". 
    Create between 4 to 8 widgets including stats and charts (line-chart, bar-chart, pie-chart, area-chart). 
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
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['stat', 'line-chart', 'bar-chart', 'pie-chart', 'area-chart'] },
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
                      value: { type: Type.NUMBER }
                    }
                  }
                },
                color: { type: Type.STRING }
              },
              required: ['id', 'type', 'title']
            }
          }
        },
        required: ['title', 'description', 'widgets', 'themeColor']
      }
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text.trim()) as DashboardData;
};

export const updateDashboardSchema = async (currentData: DashboardData, command: string): Promise<DashboardData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an expert Dashboard Engineer. 
    Current Dashboard JSON: ${JSON.stringify(currentData)}
    
    User Command: "${command}"
    
    Modify the dashboard according to the user command. You can add, remove, or modify widgets, change themes, or update data. 
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
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['stat', 'line-chart', 'bar-chart', 'pie-chart', 'area-chart'] },
                title: { type: Type.STRING },
                value: { type: Type.STRING },
                unit: { type: Type.STRING },
                trend: {
                  type: Type.OBJECT,
                  properties: {
                    value: { type: Type.NUMBER },
                    isUpward: { type: Type.BOOLEAN }
                  }
                },
                chartData: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.NUMBER }
                    }
                  }
                },
                color: { type: Type.STRING }
              },
              required: ['id', 'type', 'title']
            }
          }
        },
        required: ['title', 'description', 'widgets', 'themeColor']
      }
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text.trim()) as DashboardData;
};
