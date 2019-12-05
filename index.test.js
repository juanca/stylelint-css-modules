const index = require('./index.js');

test('index file has correct syntax', () => {
  expect(index.length).toEqual(2);
});
