// src/ai/flows/generate-word-problem-flow.ts
'use server';
/**
 * @fileOverview 此檔案定義了一個 Genkit 流程，用於從使用者提供的生活情境文字中生成數學應用題。
 *
 * - generateWordProblemFromScenario - 主要函式，接收情境文字並回傳結構化的數學問題、算式、解法和解釋。
 * - GenerateWordProblemInput - 輸入的 TypeScript 型別。
 * - GenerateWordProblemOutput - 輸出的 TypeScript 型別。
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateWordProblemInputSchema, GenerateWordProblemOutputSchema } from '../schemas/word-problem-schemas';

export type GenerateWordProblemInput = z.infer<typeof GenerateWordProblemInputSchema>;
export type GenerateWordProblemOutput = z.infer<typeof GenerateWordProblemOutputSchema>;

export async function generateWordProblemFromScenario(
  input: GenerateWordProblemInput
): Promise<GenerateWordProblemOutput> {
  return generateWordProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWordProblemPrompt',
  input: {schema: GenerateWordProblemInputSchema},
  output: {schema: GenerateWordProblemOutputSchema},
  prompt: `您是一位樂於助人的 AI 數學老師，專長是將日常生活中的情境描述轉換為國中程度的數學應用題，並提供詳細的解析。請遵循以下指示：

任務：
1.  **理解原始情境**：仔細閱讀使用者提供的「情境描述 (scenarioText)」。
2.  **重組為數學應用題**：將原始情境清晰地、有條理地改寫成一個完整的數學應用題，填入 'formulatedProblem' 欄位。這個應用題應該能夠從原始情境中直接推導出來。
3.  **提取數學算式**：從您重組的數學應用題中，提取出能解決該問題的核心數學算式，填入 'mathExpression' 欄位。算式應盡可能簡潔明瞭。
4.  **計算答案**：計算出該數學算式的答案，填入 'solution' 欄位。
5.  **提供詳細解釋**：在 'explanation' 欄位中，用繁體中文詳細解釋：
    *   如何從「原始情境」中識別出重要的數字和關係。
    *   如何將這些數字和關係轉換為「數學算式」。
    *   解決該「數學算式」的逐步思考過程。
    *   解釋應清晰易懂，適合國中學生理解。

重要約束：
*   所有輸出內容（尤其是 'formulatedProblem', 'mathExpression', 'solution', 'explanation'）都必須使用**繁體中文**。
*   生成的應用題和算式應符合國中數學的範圍和難度。
*   如果原始情境不足以形成一個清晰的數學問題，或者情境過於複雜超出了國中數學範圍，請在 'formulatedProblem' 中禮貌說明，並在其他欄位中提供適當的提示或留空。

使用者提供的原始情境如下：
{{{scenarioText}}}

請將您的分析結果結構化地填入 'originalScenario', 'formulatedProblem', 'mathExpression', 'solution', 和 'explanation' 欄位。
'originalScenario' 欄位應直接複製使用者輸入的 {{{scenarioText}}}。
`,
});

const generateWordProblemFlow = ai.defineFlow(
  {
    name: 'generateWordProblemFlow',
    inputSchema: GenerateWordProblemInputSchema,
    outputSchema: GenerateWordProblemOutputSchema,
  },
  async (input: GenerateWordProblemInput) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI 未能成功生成應用題。");
    }
    // 確保 originalScenario 被正確填入
    return {
      ...output,
      originalScenario: input.scenarioText, 
    };
  }
);
