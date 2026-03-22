# Test Strategy - Simple but Useful

## Testing Philosophy
- **Headless only**: Tests run in ChromeHeadless (no GUI needed)
- **No watch mode**: Single run, auto-exit after completion
- **Simple over complex**: Prefer straightforward tests over complex setups
- **Value-focused**: Test what matters, skip edge cases unless critical

## Test Configuration
- **Runner**: Karma
- **Browser**: ChromeHeadless
- **Framework**: Jasmine
- **Mode**: Single run (not watching)
- **Coverage**: Basic, not exhaustive

## What We Test
1. **Core functionality** - Does the feature work?
2. **User interactions** - Can users interact with it?
3. **State changes** - Does the UI update correctly?
4. **Service integration** - Do services work as expected?

## What We Skip
1. **Perfect coverage** - Not aiming for 100%
2. **Edge cases** - Unless they're critical
3. **Visual perfection** - CSS/visual tests are minimal
4. **Performance testing** - Not in unit tests

## Test Commands
```bash
npm test          # Run all tests (headless, single run)
npm run build     # Build for production
npm run deploy    # Deploy to public directory
```

## Why This Approach?
- **Fast development**: Less time writing tests, more time building
- **Maintainable**: Simple tests are easier to understand and update
- **Practical**: Tests what users actually experience
- **Efficient**: Headless runs are fast and CI/CD friendly
