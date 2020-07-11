function parseCssVar(parameters) {
  const comma = parameters.indexOf(',');
  if (comma === -1) return [parameters];

  const first = parameters.slice(0, comma);
  const fallback = parameters.slice(comma + 1).trim();

  if (fallback.includes('var(')) {
    const fallbackVar = parseCssValue(fallback);
    return [first, ...fallbackVar];
  }

  return [first, fallback.trim()];
}

function parseCssValue(value) {
  let functionDepth = 0;
  const varIndices = Array.from(value).reduce((vars, char, index) => {
    const initial = vars.slice(0, vars.length - 1);
    const last = vars[vars.length - 1] || [];
    const functionName = value.slice(index - 3, index);

    if (char === '(' && (functionName === 'var' || functionDepth > 0)) {
      functionDepth += 1;

      if (functionDepth === 1) {
        return [...vars, [index]];
      }
    }

    if (char === ')' && functionDepth > 0) {
      functionDepth -= 1;

      if (functionDepth === 0) {
        return [...initial, [last[0], index]];
      }
    }

    return vars;
  }, []);

  const varTokens = varIndices.reduce((tokens, indices) => {
    return [...tokens, value.slice(indices[0] + 1, indices[1])];
  }, []);

  return varTokens.map(parseCssVar);
}

module.exports = parseCssValue;
