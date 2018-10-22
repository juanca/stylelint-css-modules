const stylelint = require('stylelint');
const pattern = require('./composed-class-names.js');

stylelint.lint({
  config: {
    plugins: [
      './composed-class-names.js',
    ],
    rules: {
      'css-modules/composed-class-names': [true, {}],
    },
  },
  configBasedir: 'rules',
  files: ['fixtures/composed-class-names/*.css'],
}).then(function (resultObject) {
  console.log('then', resultObject);
}).catch(function (error) {
  console.error('error', error);
});
