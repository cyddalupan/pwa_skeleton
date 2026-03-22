// Simple test to verify test infrastructure works
describe('Simple Test Infrastructure', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should verify test environment is working', () => {
    const result = 1 + 1;
    expect(result).toBe(2);
  });
});