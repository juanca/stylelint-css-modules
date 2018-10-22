const testRule = require('stylelint-test-rule-tape');
const pattern = require('./composed-class-names.js');

testRule(pattern.rule, {
  config: null,
  ruleName: pattern.ruleName,
  skipBasicChecks: true,

  accept: [],
  reject: [],
});
