const stylelint = require('stylelint');
const pattern = require('./composed-class-names.js');

function configuration(options) {
  return Object.assign({
    config: {
      plugins: ['./composed-class-names.js'],
      rules: {
        'css-modules/composed-class-names': [true, {}],
      },
    },
    configBasedir: 'rules',
  }, options);
}

test('composed-class-names rule parses correct compose statements', () => {
  return stylelint.lint(configuration({
    files: require.resolve('../fixtures/composed-class-names/passes.css'),
  })).then(function (resultObject) {
    expect(resultObject.errored).toBe(false);
  });
});

test('composed-class-names rule fails on missing local class names', () => {
  return stylelint.lint(configuration({
    files: require.resolve('../fixtures/composed-class-names/fails-local-class-name.css'),
  })).then(function (resultObject) {
    expect(resultObject.errored).toBe(true);

    const output = JSON.parse(resultObject.output);
    expect(output.length).toBe(1);
    expect(output[0].warnings[0].severity).toBe('error');
  });
});
