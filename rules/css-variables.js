const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');

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

  return (root, result) => {
    const contextPath = path.dirname(result.opts.from);
    const imports = (result.css.match(/(?<=@import )['"].*['"]/g) || [])
      .map(line => line.slice(1, -1))
      .map(filePath => resolveFilePath(contextPath, filePath))
    ;

    root.walkDecls((decl) => {
      (decl.value.match(/var\(.*\)/g) || [])
        .map(expression => expression.slice(4, -1))
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
