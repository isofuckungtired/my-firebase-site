// src/ai/flows/get-knowledge-points.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting relevant knowledge points from a math solution.
 *
 * - getKnowledgePoints - A function that takes a math solution and returns related knowledge points.
 * - GetKnowledgePointsInput - The input type for the getKnowledgePoints function.
 * - GetKnowledgePointsOutput - The return type for the getKnowledgePoints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetKnowledgePointsInputSchema = z.object({
  mathSolution: z
    .string()
    .describe('已解決的數學問題的詳細步驟。'),
});
export type GetKnowledgePointsInput = z.infer<typeof GetKnowledgePointsInputSchema>;

const GetKnowledgePointsOutputSchema = z.object({
  knowledgePoints: z
    .string()
    .describe('與提供的數學解題步驟相關的知識點、定義或公式的摘要。'),
});
export type GetKnowledgePointsOutput = z.infer<typeof GetKnowledgePointsOutputSchema>;

export async function getKnowledgePoints(input: GetKnowledgePointsInput): Promise<GetKnowledgePointsOutput> {
  return getKnowledgePointsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getKnowledgePointsPrompt',
  input: {schema: GetKnowledgePointsInputSchema},
  output: {schema: GetKnowledgePointsOutputSchema},
  prompt: `您是一位樂於助人的 AI 數學輔導老師。根據以下數學解題步驟，請用繁體中文提取關鍵的數學概念、公式或定義，並提供簡潔的解釋，以幫助學生鞏固所學。請將每個知識點分開列出，使其清晰易懂。

數學解題步驟:
{{{mathSolution}}}

相關知識點:`,
});

const getKnowledgePointsFlow = ai.defineFlow(
  {
    name: 'getKnowledgePointsFlow',
    inputSchema: GetKnowledgePointsInputSchema,
    outputSchema: GetKnowledgePointsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
