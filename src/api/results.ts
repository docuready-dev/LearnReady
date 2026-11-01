import { StorageService } from '../services/storageService';
import { ExamResultRecord } from '../types';

export type GetResultsOutputType = {
  results: ExamResultRecord[];
};

export async function saveResult(input: {
  candidateId: string;
  name: string;
  email: string;
  age: number;
  board: string;
  region: string;
  educationLevel: string;
  totalScore: number;
  verbalScore: number;
  numericalScore: number;
  spatialScore: number;
  profile: string;
  percentile: number;
  nationalRank: number;
}): Promise<{ success: boolean; id?: string }> {
  return await StorageService.saveResult(input);
}

export async function getResults(_input?: Record<string, unknown>): Promise<GetResultsOutputType> {
  const results = await StorageService.getAllResults();
  return { results };
}

export async function deleteResult(input: { id: string }): Promise<{ success: boolean }> {
  return await StorageService.deleteResult(input.id);
}
