const { add } = require('../index.cjs');

test('adds numbers correctly', () => {
  expect(add(2, 3)).toBe(5);
});
