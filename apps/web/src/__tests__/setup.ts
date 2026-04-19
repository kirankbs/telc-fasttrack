import '@testing-library/jest-dom';

// Stub HTMLMediaElement methods not implemented by jsdom
Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: () => {},
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: () => {},
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: () => Promise.resolve(),
});
