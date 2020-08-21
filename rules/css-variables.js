const fs = require('fs');
const path = require('path');
const resolve = require('enhanced-resolve');
const stylelint = require('stylelint');
const cssVariablesParser = require('./css-variables-parser.js');

const messages = stylelint.utils.ruleMessages('css-modules/css-variables', {
  expected: (variable) => `Unable to find CSS variable "${variable}"`,
})

module.exports = stylelint.createPlugin('css-modules/css-variables', (primaryOption, secondaryOptionObject) => {
  const defaultResolveOptions = {
    extensions: ['.css'],
  };
  const options = secondaryOptionObject || { resolve: undefined };
  const resolveFilePath = resolve.create.sync(Object.assign({}, defaultResolveOptions, options.resolve));

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
