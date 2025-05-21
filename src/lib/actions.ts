// src/lib/actions.ts
'use server';

import { solveMathProblem, type SolveMathProblemInput, type SolveMathProblemOutput } from '@/ai/flows/solve-math-problem';
import { getKnowledgePoints, type GetKnowledgePointsInput, type GetKnowledgePointsOutput } from '@/ai/flows/get-knowledge-points';
import { 
  analyzeErrorPatterns, 
  type AnalyzeErrorPatternsInput, 
  type AnalyzeErrorPatternsOutput 
} from '@/ai/flows/analyze-error-patterns-flow';
// Removed GenerateWordProblem related imports as the feature was removed

// Extend SolveMathProblemInput for the action to include userAttempt
export interface SolveMathProblemActionInput extends SolveMathProblemInput {}

export interface SolveMathProblemActionResult extends SolveMathProblemOutput {
  knowledgePoints?: string;
}

export async function solveMathProblemAction(
  input: SolveMathProblemActionInput
): Promise<SolveMathProblemActionResult | { error: string; solution?: string }> {
  try {
    // Basic validation, Zod schema validation happens within the flow
    if (!input.photoDataUri || !input.photoDataUri.startsWith('data:image/')) {
      return { error: '無效的圖片資料 URI。' };
    }
    
    const solutionResult = await solveMathProblem({
      photoDataUri: input.photoDataUri,
      userAttempt: input.userAttempt,
    });

    if (solutionResult.solution) {
      try {
        const politeRejections = ["抱歉，我只能協助您解決數學相關的問題。", "這似乎不是一個數學問題，我主要負責數學解題喔。"];
        if (politeRejections.some(rejection => solutionResult.solution.includes(rejection))) {
          return {
            solution: solutionResult.solution,
            userAttemptFeedback: solutionResult.userAttemptFeedback,
            knowledgePoints: undefined,
          };
        }

        const knowledgePointsResult = await getKnowledgePoints({ mathSolution: solutionResult.solution });
        return {
          ...solutionResult,
          knowledgePoints: knowledgePointsResult.knowledgePoints,
        };
      } catch (knowledgeError) {
        console.error('Error in getKnowledgePoints:', knowledgeError);
        return { 
          ...solutionResult,
          knowledgePoints: undefined, 
          error: '無法獲取相關知識點，但已提供解題方案。' 
        };
      }
    } else { 
      return { error: '解題失敗，未獲得解題方案。' };
    }

  } catch (error) {
    console.error('Error in solveMathProblemAction:', error);
    return { error: '解題失敗。請重試。' };
  }
}

// Server Action 用於分析錯題模式
export async function analyzeErrorPatternsAction(
  input: AnalyzeErrorPatternsInput
): Promise<AnalyzeErrorPatternsOutput | { error: string }> {
  try {
    const result = await analyzeErrorPatterns(input);
    return result;
  } catch (error) {
    console.error('Error in analyzeErrorPatternsAction:', error);
    const errorMessage = error instanceof Error ? error.message : '分析錯誤模式時發生未知錯誤。';
    return { error: errorMessage };
  }
}
