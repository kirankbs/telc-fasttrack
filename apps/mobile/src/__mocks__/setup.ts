// Global test setup.
// Silence console.error/warn noise from components under test.
// Don't silence console.log — it's useful for debugging.

const originalError = console.error.bind(console);
const originalWarn = console.warn.bind(console);

beforeAll(() => {
  console.error = (msg: string, ...args: unknown[]) => {
    // Suppress known React Native / testing-library noise
    if (
      typeof msg === 'string' &&
      (msg.includes('Warning: ReactDOM.render') ||
        msg.includes('Warning: An update to') ||
        msg.includes('act(...)'))
    ) {
      return;
    }
    originalError(msg, ...args);
  };

  console.warn = (msg: string, ...args: unknown[]) => {
    // Suppress known benign warnings
    if (
      typeof msg === 'string' &&
      msg.includes('expo-sqlite')
    ) {
      return;
    }
    originalWarn(msg, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
