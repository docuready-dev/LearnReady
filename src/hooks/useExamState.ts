import { useState, useEffect, useCallback } from 'react';
import { ExamState, SessionQuestionIds, TestMode } from '../types';
import { generateSessionQuestions } from '../data/randomizer';

const STORAGE_KEY = 'learnready_exam_v1';
export const TOTAL_SECONDS = 5400;  // 90 min — full test
export const QUICK_SECONDS = 1800; // 30 min — quick test

export function getTotalSeconds(mode?: TestMode): number {
  return mode === 'quick' ? QUICK_SECONDS : TOTAL_SECONDS;
}

const emptyQuestionIds: SessionQuestionIds = { verbal: [], numerical: [], spatial: [], personality: [] };

const defaultState: ExamState = {
  candidateId: '', email: '', name: '', age: '', region: '',
  educationLevel: '', board: '', testMode: 'full',
  startTime: 0, currentSection: 0, currentQuestion: 0,
  answers: {}, submittedSections: [false, false, false, false],
  completed: false, questionIds: emptyQuestionIds,
};

function loadState(): ExamState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState;
    const parsed: ExamState = JSON.parse(stored);
    const merged = { ...defaultState, ...parsed };
    const totalSec = getTotalSeconds(merged.testMode);
    if (merged.startTime && !merged.completed) {
      const elapsed = Math.floor((Date.now() - merged.startTime) / 1000);
      if (elapsed >= totalSec) {
        return { ...merged, submittedSections: [true, true, true, true], completed: true };
      }
    }
    return merged;
  } catch {
    return defaultState;
  }
}

export function useExamState() {
  const [state, setState] = useState<ExamState>(loadState);
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    const s = loadState();
    const totalSec = getTotalSeconds(s.testMode);
    if (!s.startTime || s.completed) return totalSec;
    return Math.max(0, totalSec - Math.floor((Date.now() - s.startTime) / 1000));
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!state.startTime || state.completed) return;
    const totalSec = getTotalSeconds(state.testMode);
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
      const remaining = Math.max(0, totalSec - elapsed);
      setTimeRemaining(remaining);
      if (remaining === 0) {
        setState(prev => ({ ...prev, submittedSections: [true, true, true, true], completed: true }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state.startTime, state.completed, state.testMode]);

  const startExam = useCallback((
    candidateId: string, email: string, name: string, age: string,
    region: string, educationLevel: string, board: string, testMode: TestMode = 'full'
  ) => {
    const startTime = Date.now();
    const questionIds = generateSessionQuestions(candidateId, startTime, testMode);
    setState({
      ...defaultState,
      candidateId,
      email,
      name,
      age,
      region,
      educationLevel,
      board,
      testMode,
      startTime,
      questionIds,
    });
    setTimeRemaining(getTotalSeconds(testMode));
  }, []);

  const setAnswer = useCallback((questionId: string, answer: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
    }));
  }, []);

  const submitSection = useCallback((sectionIndex: number) => {
    setState(prev => {
      const newSubmitted = [...prev.submittedSections];
      newSubmitted[sectionIndex] = true;
      const allDone = newSubmitted.every(Boolean);
      return {
        ...prev,
        submittedSections: newSubmitted,
        currentSection: allDone ? prev.currentSection : Math.min(sectionIndex + 1, 3),
        currentQuestion: 0,
        completed: allDone,
      };
    });
  }, []);

  const setCurrentQuestion = useCallback((q: number) => setState(prev => ({ ...prev, currentQuestion: q })), []);
  const setCurrentSection = useCallback((s: number) => setState(prev => ({ ...prev, currentSection: s, currentQuestion: 0 })), []);
  const resetExam = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
    setTimeRemaining(TOTAL_SECONDS);
  }, []);

  return {
    state,
    timeRemaining,
    startExam,
    setAnswer,
    submitSection,
    setCurrentQuestion,
    setCurrentSection,
    resetExam,
  };
}
