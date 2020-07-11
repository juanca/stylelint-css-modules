const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');
const cssVariablesParser = require('./css-variables-parser.js');

const messages = stylelint.utils.ruleMessages('css-modules/css-variables', {
  expected: (variable) => `Unable to find CSS variable "${variable}"`,
})

module.exports = stylelint.createPlugin('css-modules/css-variables', (primaryOption, secondaryOptionObject) => {
  const options = secondaryOptionObject || { resolve: undefined };
  const resolve = options.resolve || { alias: {}, modules: [] };
  const aliasMap = resolve.alias || {};
  const aliases = Object.keys(aliasMap);
  const modules = resolve.modules || [];

  function resolveFilePath(contextPath, filePath) {
    if (filePath[0] === '.') {
      return path.join(contextPath, filePath);
    } else {
      // Copy webpack resolution algorithm -- is this a module I can just import?
      let resolvedFilePath = filePath;
      const rootDirectory = resolvedFilePath.split(path.sep)[0];
      const rootAlias = aliases.find(alias => alias === rootDirectory);

      if (rootAlias) {
        resolvedFilePath = path.join(aliasMap[rootAlias], ...resolvedFilePath.split(path.sep).slice(1))
        if (fs.existsSync(resolvedFilePath)) {
          return resolvedFilePath;
        }
      }

      resolvedFilePath = modules
        .map(module => path.join(module, resolvedFilePath))
        .find(maybePath => fs.existsSync(maybePath));

      return resolvedFilePath || filePath;
    }
  }

  function expressionReducer(expression) {
    if (expression.length === 1) {
      return expression[0];
    }

    return expression[1] instanceof Array ? expressionReducer(expression[1]) : expression[1];
  }

  return (root, result) => {
    const contextPath = path.dirname(result.opts.from);
    const imports = (result.css.match(/(?<=@import )['"].*['"]/g) || [])
      .map(line => line.slice(1, -1))
      .filter(filePath => filePath.includes('.')) // TODO: Leverage Webpack extensions -- somehow
      .map(filePath => resolveFilePath(contextPath, filePath))
    ;

    root.walkDecls((decl) => {
      const expressions = cssVariablesParser(decl.value);
      const variableValues = expressions.map(expressionReducer);

      variableValues
        .filter(value => value.includes('--')) // Skip validation if the css variable had a non-var fallback
        .filter(variable => !RegExp(`${variable}:`).test(decl.source.input.css)) // Is it defined locally?
        .filter(variable => !imports.find(filePath => RegExp(`${variable}:`).test(fs.readFileSync(filePath)))) // Is it defined in an imported file?
        .forEach(variable => stylelint.utils.report({
          index: decl.lastEach,
          message: messages.expected(variable),
          node: decl,
          result: result,
          ruleName: 'css-modules/css-variables',
        }))
      ;
    });
  };
});

module.exports.ruleName = 'css-modules/css-variables';
