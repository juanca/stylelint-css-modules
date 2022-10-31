const stylelint = require('stylelint');
const path = require('path');

function configuration(options) {
  return Object.assign({
    config: {
      plugins: ['./css-variables.js'],
      rules: {
        'css-modules/css-variables': [true, {
          resolve: {
            extensions: ['.css', '.scss'],
            modules: ['src'],
          },
        }],
      },
    },
    configBasedir: 'rules',
  }, options);
}

test('css-variables rule parses correct usages of CSS variables', () => {
  return stylelint.lint(configuration({
    files: require.resolve('../fixtures/css-variables/passes.css'),
  })).then(function (resultObject) {
    const output = JSON.parse(resultObject.output);
    expect(output[0].warnings).toEqual([]);
  });
});

test('css-variables rule parses correct usages of globally available CSS variables', () => {
  return stylelint.lint(configuration({
    config: {
      plugins: ['./css-variables.js'],
      rules: {
        'css-modules/css-variables': [true, {
          globals: [
            path.join(__dirname, '../fixtures/css-variables/src/global-vars.css'),
          ],
        }],
      },
    },
    files: require.resolve('../fixtures/css-variables/globally-passes.css'),
  })).then(function (resultObject) {
    const output = JSON.parse(resultObject.output);
    expect(output[0].warnings).toEqual([]);
  });
});

test('css-variables rule fails on undefined variable', () => {
  return stylelint.lint(configuration({
    files: require.resolve('../fixtures/css-variables/fails-undefined-variable.css'),
  })).then(function (resultObject) {
    expect(resultObject.errored).toBe(true);

    const output = JSON.parse(resultObject.output);
    expect(output[0].warnings[0].severity).toBe('error');
  });
});

test('css-variables rule fails on missing import', () => {
  return stylelint.lint(configuration({
    files: require.resolve('../fixtures/css-variables/fails-missing-import.css'),
  })).then(function (resultObject) {
    expect(resultObject.errored).toBe(true);

    const output = JSON.parse(resultObject.output);
    expect(output[0].warnings[0].severity).toBe('error');
  });
});
