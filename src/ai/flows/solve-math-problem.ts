// src/ai/flows/solve-math-problem.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for solving math problems from an image,
 * optionally considering a user's attempted solution. It will only respond to math-related queries.
 *
 * - solveMathProblem - A function that takes an image of a math problem and returns a step-by-step solution,
 *                      along with feedback if a user's attempt is provided. If the input is not a math problem,
 *                      it will politely decline.
 * - SolveMathProblemInput - The input type for the solveMathProblem function.
 * - SolveMathProblemOutput - The return type for the solveMathProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveMathProblemInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a math problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userAttempt: z
    .string()
    .optional()
    .describe('學生對問題的初步嘗試或答案。'),
});
export type SolveMathProblemInput = z.infer<typeof SolveMathProblemInputSchema>;

const SolveMathProblemOutputSchema = z.object({
  solution: z.string().describe('如果判斷為數學問題，則為逐步解法及對使用者嘗試的回饋（若有提供）。如果非數學問題，則為禮貌性的回絕訊息。'),
  // Added for more structured feedback on user's attempt
  userAttemptFeedback: z.object({
    isMostlyCorrect: z.boolean().describe("使用者的嘗試是否大致正確。").optional(),
    feedbackText: z.string().describe("對使用者嘗試的具體回饋文字。").optional(),
  }).optional().describe("對使用者嘗試的評估與回饋。"),
});
export type SolveMathProblemOutput = z.infer<typeof SolveMathProblemOutputSchema>;

export async function solveMathProblem(input: SolveMathProblemInput): Promise<SolveMathProblemOutput> {
  return solveMathProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveMathProblemPrompt',
  input: {schema: SolveMathProblemInputSchema},
  output: {schema: SolveMathProblemOutputSchema},
  prompt: `您是一位專門解答數學問題的AI輔導老師。您的任務是判斷提供的圖片是否為數學相關問題。

- 如果提供的內容是數學問題：
  {{#if userAttempt}}
  學生的嘗試如下：
  {{{userAttempt}}}
  請先評估學生的嘗試。然後，無論學生的嘗試如何，都請用繁體中文提供該問題的完整逐步解答。在提供標準解答後，請針對學生的嘗試給予回饋，並設定 userAttemptFeedback.isMostlyCorrect (true/false) 以及 userAttemptFeedback.feedbackText。您的回饋應該是鼓勵性和建設性的。
  - 如果學生的嘗試是正確的，請給予肯定。
  - 如果學生的嘗試部分正確或方向正確，請指出其優點並提示接下來的改進方向。
  - 如果學生的嘗試有明顯錯誤，請簡要指出學生可能犯錯的關鍵概念或步驟，並引導他們對照標準解法學習。
  {{else}}
  請用繁體中文提供該問題的逐步解答。
  {{/if}}
- 如果提供的內容**不是**數學問題（例如，只是風景圖片、純文字聊天、詢問非數學知識等），請用繁體中文禮貌地回覆，將回覆內容放在 'solution' 欄位中，例如：「抱歉，我只能協助您解決數學相關的問題。」或「這似乎不是一個數學問題，我主要負責數學解題喔。」。在這種情況下，請不要提供 userAttemptFeedback。

問題圖片: {{media url=photoDataUri}}

逐步解答與回饋 (如果判斷為數學問題) / 或禮貌回絕 (如果判斷為非數學問題):
`,
});

const solveMathProblemFlow = ai.defineFlow(
  {
    name: 'solveMathProblemFlow',
    inputSchema: SolveMathProblemInputSchema,
    outputSchema: SolveMathProblemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
