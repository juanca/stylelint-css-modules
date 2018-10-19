const stylelint = require('stylelint');

module.exports = stylelint.createPlugin('css-modules/test', (options) => {
  console.log('options', options);

  return (root, result) => {
    console.log('root', root);
    console.log('result', result);

    root.walkDecls((decl) => {
      console.log('decl', decl);
    });
  };
});

module.exports.ruleName = 'css-modules/test';
