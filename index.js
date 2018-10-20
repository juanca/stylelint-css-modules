const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');

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
        const classNames = decl.value.split('from')[0].replace(/\s+/g, ' ').trim().split(' ');
        const fromExpression = decl.value.split('from')[1].trim();

        if (fromExpression === 'global') {
          return;
        }

        const fromFilePath = resolveFilePath(contextPath, fromExpression.slice(1, -1));
        const fileContents = fs.readFileSync(fromFilePath, 'utf-8');

        classNames
          .filter(className => !fileContents.includes(`.${className}`))
          .forEach(className => stylelint.utils.report({
            index: decl.lastEach,
            message: utils.ruleMessages('css-modules/test', {
              expected: selector => `Unable to find ${className} in ${fromFilePath}`,
            }),
            node: decl,
            result: result,
            ruleName: 'css-modules/test',
          }));
      }
    });
  };
});

module.exports.ruleName = 'css-modules/test';
