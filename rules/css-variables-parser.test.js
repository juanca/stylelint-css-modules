const parser = require('./css-variables-parser.js');

describe('css-variables-parser', () => {
  it('parses a simple value', () => {
    const results = parser('pink');
    expect(results.length).toEqual(0);
  });

  it('parses a simple css variable', () => {
    const results = parser('var(--test-var)');
    expect(results.length).toEqual(1);
    expect(results[0]).toEqual(['--test-var']);
  });

  it('parses a simple css variable with a fallback value', () => {
    const results = parser('var(--test-var, 10px)');
    expect(results.length).toEqual(1);
    expect(results[0]).toEqual(['--test-var', '10px']);
  });

  it('parses a simple css variable with a fallback css variable', () => {
    const results = parser('var(--test-var, var(--fallback-var))');
    expect(results.length).toEqual(1);
    expect(results[0]).toEqual(['--test-var', ['--fallback-var']]);
  });

  it('parses a simple css variable with a fallback css variable with a fallback value', () => {
    const results = parser('var(--test-var, var(--fallback-var, 10px))');
    expect(results.length).toEqual(1);
    expect(results[0]).toEqual(['--test-var', ['--fallback-var', '10px']]);
  });

  it('parses a simple css function', () => {
    const results = parser('calc(10px + 50%)');
    expect(results.length).toEqual(0);
  });

  it('parses a simple css function with a nested css variable', () => {
    const results = parser('calc(var(--small-size) + var(--large-size))');
    expect(results.length).toEqual(2);
    expect(results[0]).toEqual(['--small-size']);
    expect(results[1]).toEqual(['--large-size']);
  });

  it('parses a complex fallback variable', () => {
    const results = parser('var(--small-size, calc(10px + var(--large-size))');
    expect(results.length).toEqual(1);
    expect(results[0]).toEqual(['--small-size', ['--large-size']]);
  });
});
