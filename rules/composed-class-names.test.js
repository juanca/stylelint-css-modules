const stylelint = require('stylelint');
const pattern = require('./composed-class-names.js');

test('the plugin parses correct compose statements', () => {
  return stylelint.lint({
    config: {
      plugins: ['./composed-class-names.js'],
      rules: {
        'css-modules/composed-class-names': [true, {}],
      },
    },
    configBasedir: 'rules',
    files: ['fixtures/composed-class-names/passes.css'],
  }).then(function (resultObject) {
    expect(resultObject.errored).toBe(false);
  });
});
