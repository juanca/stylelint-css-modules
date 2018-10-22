const stylelint = require('stylelint');
const pattern = require('./composed-class-names.js');

test('composed-class-names rule parses correct compose statements', () => {
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

test('composed-class-names rule fails on missing local class names', () => {
  return stylelint.lint({
    config: {
      plugins: ['./composed-class-names.js'],
      rules: {
        'css-modules/composed-class-names': [true, {}],
      },
    },
    configBasedir: 'rules',
    files: ['fixtures/composed-class-names/fails-local-class-name.css'],
  }).then(function (resultObject) {
    expect(resultObject.errored).toBe(true);
  });
});
