import { TestRun, TestStatus, TestResult } from './types';

// Helper to generate consistent mock data
const SUITES = ['Authentication', 'Checkout', 'Inventory', 'Profile', 'Search', 'API Core'];
const ENVIRONMENTS = ['staging', 'production', 'dev'] as const;

const generateTestCases = () => {
  const cases = [];
  for (const suite of SUITES) {
    for (let i = 1; i <= 5; i++) {
      cases.push({
        id: `TC-${suite.substring(0, 3).toUpperCase()}-${i}`,
        name: `Verify ${suite} Scenario ${i}`,
        suite: suite
      });
    }
  }
  return cases;
};

const TEST_CASES = generateTestCases();

const generateRun = (id: string, dateOffsetDays: number): TestRun => {
  const date = new Date();
  date.setDate(date.getDate() - dateOffsetDays);

  const results: TestResult[] = TEST_CASES.map(tc => {
    // Randomize status with weight towards PASS
    const rand = Math.random();
    let status = TestStatus.PASS;
    let errorLog = undefined;
    let bugTicketId = undefined;

    if (rand > 0.90) {
      status = TestStatus.FAIL;
      errorLog = `AssertionError: Expected true to be false in ${tc.name}\n    at Context.<anonymous> (test/${tc.suite.toLowerCase()}.spec.js:42:12)\n    Note: Element #submit-btn not visible within 5000ms.`;
      if (Math.random() > 0.7) bugTicketId = 'JIRA-1234';
    } else if (rand > 0.85) {
      status = TestStatus.NOT_RUN;
    }

    // Flaky simulation for history
    if (tc.name.includes('Scenario 3') && Math.random() > 0.6) {
        status = TestStatus.FAIL;
        errorLog = `TimeoutError: Network request failed`;
    }

    // Performance metric simulation (e.g. page load time)
    const baseMetric = 1000 + Math.random() * 500;
    const spike = Math.random() > 0.95 ? 2000 : 0; // Occasional spike

    return {
      id: `${id}-${tc.id}`,
      testCaseId: tc.id,
      testCaseName: tc.name,
      suite: tc.suite,
      status,
      durationMs: Math.floor(Math.random() * 2000) + 100, // 100ms to 2.1s
      timestamp: date.toISOString(),
      errorLog,
      bugTicketId,
      performanceMetric: baseMetric + spike
    };
  });

  const passed = results.filter(r => r.status === TestStatus.PASS).length;
  const failed = results.filter(r => r.status === TestStatus.FAIL).length;
  const skipped = results.filter(r => r.status === TestStatus.NOT_RUN).length;

  return {
    id,
    name: `Nightly Run ${date.toLocaleDateString()}`,
    environment: 'staging',
    timestamp: date.toISOString(),
    results,
    summary: {
      total: results.length,
      passed,
      failed,
      skipped,
      durationMs: results.reduce((acc, curr) => acc + curr.durationMs, 0)
    }
  };
};

// Generate 10 runs of history
export const MOCK_RUNS: TestRun[] = Array.from({ length: 10 }, (_, i) => 
  generateRun(`RUN-${1000 + i}`, 9 - i)
).reverse(); // Newest first

export const ALL_TEST_CASES = TEST_CASES;
