const index = require('./index.js');

test('index file has correct synax', () => {
  expect(index.length).toEqual(2);
});
