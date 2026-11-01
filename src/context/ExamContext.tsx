import { createContext, useContext, ReactNode, useState } from 'react';
import { useExamState } from '../hooks/useExamState';
import { ExamState, Page } from '../types';

type ExamStateHook = ReturnType<typeof useExamState>;

interface ExamContextValue extends ExamStateHook {
  page: Page;
  setPage: (page: Page) => void;
}

const ExamContext = createContext<ExamContextValue | null>(null);

function getInitialPage(state: ExamState): Page {
  if (state.completed) return 'results';
  if (state.startTime > 0) return 'exam';
  return 'landing';
}

export function ExamProvider({ children }: { children: ReactNode }) {
  const examHook = useExamState();
  const [page, setPage] = useState<Page>(() => getInitialPage(examHook.state));

  return (
    <ExamContext.Provider value={{ ...examHook, page, setPage }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error('useExam must be used within ExamProvider');
  return ctx;
}
