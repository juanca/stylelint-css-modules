const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');

const messages = stylelint.utils.ruleMessages('css-modules/test', {
  expected: (className, filePath) => `Unable to find ${className} in ${filePath}`,
})

module.exports = stylelint.createPlugin('css-modules/test', (primaryOption, secondaryOptionObject) => {
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

    root.walkDecls((decl) => {
      if (decl.prop === 'composes') {
        const expressions = decl.value.split('from');
        const classNames = expressions[0].replace(/\s+/g, ' ').trim().split(' ');
        const fromExpression = expressions[1] ? expressions[1].trim() : `'${result.opts.from}'`;

        if (fromExpression === 'global') {
          return;
        }

        const fromFilePath = resolveFilePath(contextPath, fromExpression.slice(1, -1));
        const fileContents = fs.readFileSync(fromFilePath, 'utf-8');

        classNames
          .filter(className => !className.includes('#'))
          .filter(className => !RegExp(`\\.${className}\\s*[,:{]`).test(fileContents))
          .forEach(className => stylelint.utils.report({
            index: decl.lastEach,
            message: messages.expected(className, fromFilePath),
            node: decl,
            result: result,
            ruleName: 'css-modules/test',
          }));
      }
    });
  };
});

module.exports.ruleName = 'css-modules/test';
