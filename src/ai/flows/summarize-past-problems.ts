// Summarize past problems flow.
'use server';

/**
 * @fileOverview Summarizes a user's past math problems to identify weak areas.
 *
 * - summarizePastProblems - A function that summarizes past math problems.
 * - SummarizePastProblemsInput - The input type for the summarizePastProblems function.
 * - SummarizePastProblemsOutput - The return type for the summarizePastProblems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePastProblemsInputSchema = z.object({
  problemHistory: z
    .string()
    .describe('A string containing the user past math problems and solutions.'),
});
export type SummarizePastProblemsInput = z.infer<typeof SummarizePastProblemsInputSchema>;

const SummarizePastProblemsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the user past math problems, identifying weak areas and common mistakes.'
    ),
});
export type SummarizePastProblemsOutput = z.infer<typeof SummarizePastProblemsOutputSchema>;

export async function summarizePastProblems(
  input: SummarizePastProblemsInput
): Promise<SummarizePastProblemsOutput> {
  return summarizePastProblemsFlow(input);
}

const summarizePastProblemsPrompt = ai.definePrompt({
  name: 'summarizePastProblemsPrompt',
  input: {schema: SummarizePastProblemsInputSchema},
  output: {schema: SummarizePastProblemsOutputSchema},
  prompt: `您是一位 AI 數學輔導老師。請分析以下解題歷史，並用繁體中文提供使用者薄弱環節和常見錯誤的總結。

解題歷史:
{{{problemHistory}}}`,
});

const summarizePastProblemsFlow = ai.defineFlow(
  {
    name: 'summarizePastProblemsFlow',
    inputSchema: SummarizePastProblemsInputSchema,
    outputSchema: SummarizePastProblemsOutputSchema,
  },
  async input => {
    const {output} = await summarizePastProblemsPrompt(input);
    return output!;
  }
);
