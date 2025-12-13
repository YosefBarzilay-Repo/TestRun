export enum TestStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  NOT_RUN = 'NOT_RUN',
  FLAKY = 'FLAKY'
}

export interface TestCase {
  id: string;
  name: string;
  suite: string;
}

export interface TestResult {
  id: string;
  testCaseId: string;
  testCaseName: string;
  suite: string;
  status: TestStatus;
  durationMs: number;
  errorLog?: string;
  bugTicketId?: string;
  timestamp: string;
  performanceMetric?: number; // e.g., memory usage or specific latency
}

export interface TestRun {
  id: string;
  name: string;
  environment: 'staging' | 'production' | 'dev';
  timestamp: string;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    durationMs: number;
  };
}

export type ViewMode = 'DASHBOARD' | 'HISTORY' | 'COMPARISON' | 'BENCHMARK';
