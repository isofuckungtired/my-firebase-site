// src/ai/schemas/word-problem-schemas.ts
import {z} from 'genkit';

export const GenerateWordProblemInputSchema = z.object({
  scenarioText: z
    .string()
    .min(10, { message: "情境描述至少需要10個字。" })
    .max(500, { message: "情境描述最多不超過500個字。" })
    .describe('使用者輸入的生活情境文字描述，例如：「小華有5顆蘋果，他又買了3顆，請問他現在總共有幾顆蘋果？」'),
});

export const GenerateWordProblemOutputSchema = z.object({
  originalScenario: z.string().describe('使用者輸入的原始情境文字。'),
  formulatedProblem: z.string().describe('AI 根據原始情境重新組織和闡述的數學應用題文字。'),
  mathExpression: z.string().describe('解決該問題所需的數學算式，例如 "5 + 3" 或 "100 - (15 + 3 * 20)"。'),
  solution: z.string().describe('數學算式的計算結果。'),
  explanation: z.string().describe('詳細解釋如何從原始情境文字轉換到數學算式，以及解題的思考步驟。'),
});
