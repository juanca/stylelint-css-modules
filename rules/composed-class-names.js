const fs = require('fs');
const path = require('path');
const resolve = require('enhanced-resolve');
const stylelint = require('stylelint');

const messages = stylelint.utils.ruleMessages('css-modules/composed-class-names', {
  classDoesNotExist: (className, filePath) => `Unable to find composed "${className}" class in ${filePath}`,
  fileDoesNotExist: (filePath) => `Unable to find file "${filePath}"`,
})

module.exports = stylelint.createPlugin('css-modules/composed-class-names', (primaryOption, secondaryOptionObject) => {
  const defaultResolveOptions = {
    extensions: ['.css'],
  };
  const options = secondaryOptionObject || { resolve: undefined };
  const resolveFilePath = resolve.create.sync(Object.assign({}, defaultResolveOptions, options.resolve));

  return (root, result) => {
    const contextPath = path.dirname(result.opts.from);

    root.walkDecls((decl) => {
      if (decl.prop === 'composes') {
        const expressions = decl.value.split('from');
        const classNames = expressions[0].replace(/\s+/g, ' ').trim().split(' ');
        const fromExpression = expressions[1] ? expressions[1].trim() : `'${result.opts.from}'`;
        if (fromExpression === 'global') return;

        let fromFilePath;
        try {
          fromFilePath = resolveFilePath(contextPath, fromExpression.slice(1, -1));
        } catch (e) {
          fromFilePath = path.join(contextPath, fromExpression.slice(1, -1));
        }

        if (fs.existsSync(fromFilePath) && !fs.statSync(fromFilePath).isDirectory()) {
          const fileContents = fs.readFileSync(fromFilePath, 'utf-8');

          classNames
            .filter(className => !className.includes('#'))
            .filter(className => !RegExp(`\\.${className}[\\s\\.,:{'"[]`).test(fileContents))
            .forEach(className => stylelint.utils.report({
              index: decl.lastEach,
              message: messages.classDoesNotExist(className, fromFilePath),
              node: decl,
              result: result,
              ruleName: 'css-modules/composed-class-names',
            }));

        } else {
          stylelint.utils.report({
            index: decl.lastEach,
            message: messages.fileDoesNotExist(fromFilePath),
            node: decl,
            result: result,
            ruleName: 'css-modules/composed-class-names',
          })
        }
      }
    });
  };
});

module.exports.ruleName = 'css-modules/composed-class-names';
