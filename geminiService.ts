
import { GoogleGenAI, Type } from "@google/genai";
import { DashboardData, ChartDataItem } from "./types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const WIDGET_ENUM = ['stat', 'line-chart', 'bar-chart', 'pie-chart', 'area-chart', 'scatter-plot', 'radar-chart', 'radial-bar-chart', 'funnel-chart'];
const SCATTER_SHAPES = ['circle', 'cross', 'diamond', 'square', 'star', 'triangle', 'wye'];

const SYSTEM_INSTRUCTION = `
You are a world-class Data Visualization Engineer and UI Designer. 
Your goal is to create dashboards that follow "Single Source of Truth" and "Actionable Insights" principles.

DESIGN PRINCIPLES:
1. Focus on "Data Storytelling": Use clear titles and descriptions that explain WHY the data matters.
2. Visual Hierarchy: Put the most important "North Star" metrics (stat widgets) first.
3. Clarity over Complexity: Don't overload the user. Choose the best chart type for the data (e.g., line for trends, pie for distribution, bar for comparison).
4. Realistic Data: Generate varied, high-quality sample data that looks authentic for the requested context.
5. Accessibility: Ensure descriptions are informative.

Respond with a clean, structured JSON dashboard schema.
`;

const WIDGET_PROPERTIES = {
  id: { type: Type.STRING },
  type: { type: Type.STRING, enum: WIDGET_ENUM },
  title: { type: Type.STRING },
  description: { type: Type.STRING, description: "A brief one-sentence description of what this widget represents." },
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
        date: { type: Type.STRING, description: "ISO 8601 date string (YYYY-MM-DD) if the widget represents time-series data." },
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER },
        z: { type: Type.NUMBER },
        category: { type: Type.STRING },
        fill: { type: Type.STRING }
      }
    }
  },
  scatterConfig: {
    type: Type.OBJECT,
    properties: {
      sizeKey: { type: Type.STRING },
      colorKey: { type: Type.STRING },
      shape: { type: Type.STRING, enum: SCATTER_SHAPES },
      sizeRange: { type: Type.ARRAY, items: { type: Type.NUMBER } }
    }
  },
  color: { type: Type.STRING },
  showDataLabels: { type: Type.BOOLEAN },
  showTrendline: { type: Type.BOOLEAN },
  xAxisLabel: { type: Type.STRING },
  yAxisLabel: { type: Type.STRING },
  enableZoom: { type: Type.BOOLEAN }
};

export const generateDashboardSchema = async (userPrompt: string): Promise<DashboardData> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a dashboard schema based on this request: "${userPrompt}". 
    Create between 4 to 8 widgets. 
    Provide realistic sample data. Ensure each widget has a description property.
    For time-series charts (line, area, bar), include a 'date' field in the 'chartData' items (YYYY-MM-DD).`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
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
              required: ['id', 'type', 'title', 'description']
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
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Modify the dashboard according to: "${command}". 
    Current JSON: ${JSON.stringify(currentData)}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
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
              required: ['id', 'type', 'title', 'description']
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

export const generateMockData = async (columns: string[], context: string): Promise<ChartDataItem[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a list of 10-15 data objects for a chart. 
    Columns to populate: ${columns.join(', ')}.
    Context: "${context}". 
    Ensure values are varied and realistic for the context.
    If 'date' column is present, use YYYY-MM-DD format starting from 2024-01-01.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: columns.reduce((acc, col) => {
            acc[col] = { type: (col === 'name' || col === 'category' || col === 'date') ? Type.STRING : Type.NUMBER };
            return acc;
          }, {} as any),
          required: columns
        }
      }
    }
  });

  if (!response.text) throw new Error("AI failed to generate data.");
  return JSON.parse(response.text.trim()) as ChartDataItem[];
};
