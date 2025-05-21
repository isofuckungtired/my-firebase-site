// src/ai/flows/analyze-error-patterns-flow.ts
'use server';
/**
 * @fileOverview 此檔案定義了一個 Genkit 流程，用於分析學生的錯題歷史，識別錯誤模式並提供學習建議。
 *
 * - analyzeErrorPatterns - 主要函式，接收錯題歷史的 JSON 字串並回傳分析總結。
 * - AnalyzeErrorPatternsInput - 輸入的 TypeScript 型別。
 * - AnalyzeErrorPatternsOutput - 輸出的 TypeScript 型別。
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeErrorPatternsInputSchema = z.object({
  problemHistoryJsonString: z
    .string()
    .describe(
      '一個 JSON 字串，其中包含使用者答錯的題目列表。每條記錄應包含題目描述、使用者的錯誤答案和正確的解法或答案，以及可能的相關知識點。'
    ),
});
export type AnalyzeErrorPatternsInput = z.infer<typeof AnalyzeErrorPatternsInputSchema>;

const ErrorDistributionItemSchema = z.object({
  category: z.string().describe('錯誤的類別或相關的知識點主題 (例如：分數運算、畢氏定理應用、單位換算)。'),
  count: z.number().describe('該類別的錯誤數量。'),
});

const AnalyzeErrorPatternsOutputSchema = z.object({
  summary: z
    .string()
    .describe('對學生錯誤模式的分析總結，包含主要弱點、常見錯誤類型和針對性的學習建議 (繁體中文)。'),
  errorDistribution: z
    .array(ErrorDistributionItemSchema)
    .optional()
    .describe('錯誤分佈的統計數據，用於圖表顯示。例如，哪些類型的錯誤最常發生。'),
  weakestTopics: z
    .array(z.string())
    .optional()
    .describe('根據錯題分析出的 2-3 個最薄弱的數學主題或知識領域 (繁體中文)。'),
});
export type AnalyzeErrorPatternsOutput = z.infer<typeof AnalyzeErrorPatternsOutputSchema>;

export async function analyzeErrorPatterns(
  input: AnalyzeErrorPatternsInput
): Promise<AnalyzeErrorPatternsOutput> {
  return analyzeErrorPatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeErrorPatternsPrompt',
  input: {schema: AnalyzeErrorPatternsInputSchema},
  output: {schema: AnalyzeErrorPatternsOutputSchema},
  prompt: `您是一位經驗豐富的 AI 數學輔導老師，擅長從學生的錯題中洞察學習盲點。
請仔細分析以下提供的學生錯題歷史記錄 (JSON 格式字串)。每條記錄可能包含題目描述、學生的錯誤答案、正確的解法或答案以及相關知識點。

您的任務是：
1.  **識別重複出現的錯誤模式**：例如，特定類型的計算錯誤（如正負號處理、分數運算）、公式誤用、概念混淆（如平均數與中位數）、題目理解偏差、單位換算問題等。
2.  **總結主要的學習弱點**：指出學生在哪些數學概念、單元或技能上表現較為薄弱。
3.  **提供具體的學習建議**：針對分析出的弱點，用繁體中文提供清晰、可操作的學習建議。建議應具鼓勵性，並引導學生如何改進。例如，建議複習哪些具體知識點，或練習哪種類型的題目。
4.  **結構化錯誤分佈 (errorDistribution)**：盡可能將識別出的錯誤歸納到 3-5 個主要類別 (category)，並統計每個類別的錯誤數量 (count)。如果某些題目有標註相關知識點，也可以將知識點作為錯誤分類的依據。如果難以明確分類或數量過少，此欄位可以留空。
5.  **識別最薄弱主題 (weakestTopics)**：根據整體錯誤分析，列出 2-3 個學生最需要優先加強的數學主題或知識領域。如果不明顯，此欄位可以留空。
6.  **整體評估與鼓勵**：簡要評估整體情況，並給予學生鼓勵。

請將您的分析結果整理後填入相應的輸出欄位。'summary' 欄位應包含通順的文字總結，幫助學生真正理解自己的問題所在並找到提升方向。

學生錯題歷史記錄如下：
{{{problemHistoryJsonString}}}

請開始您的分析與建議：
`,
});

const analyzeErrorPatternsFlow = ai.defineFlow(
  {
    name: 'analyzeErrorPatternsFlow',
    inputSchema: AnalyzeErrorPatternsInputSchema,
    outputSchema: AnalyzeErrorPatternsOutputSchema,
  },
  async (input: AnalyzeErrorPatternsInput) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI 未能成功分析錯誤模式。");
    }
    return output;
  }
);
