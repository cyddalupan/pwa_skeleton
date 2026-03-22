# TDD Implementation Plan - 3 Missing Features

## 🎯 Goal
Implement 3 missing features in the ToyBits PWA using Test-Driven Development (TDD)

## 📋 Missing Features
1. **🌙 Dark mode toggle in header** - Theme switching button
2. **📱 PWA installation instructions** - Device-specific install guidance  
3. **⬇️ Footer navigation icons** - Icon visibility and styling fixes

## 🔄 TDD Workflow (Red → Green → Refactor)

### PHASE 1: RED - Write Failing Tests
- Create simple tests that describe the desired behavior
- Tests should FAIL initially (no implementation yet)
- Focus on WHAT the feature should do, not HOW

### PHASE 2: GREEN - Implement Minimal Code
- Write the simplest code to make tests pass
- Don't worry about perfect code or architecture
- Just make the tests green

### PHASE 3: REFACTOR - Improve Code Quality
- Clean up the implementation
- Improve code structure and readability
- Ensure tests still pass

## 🧪 Test Strategy (Simple but Useful)
- **Headless only**: ChromeHeadless, no GUI
- **No watch mode**: Single run, auto-exit
- **Value-focused**: Test what matters
- **Skip edge cases**: Unless critical

## 📁 Implementation Order

### 1. DARK MODE TOGGLE
**Tests to write:**
- [ ] Should have dark mode toggle button in header
- [ ] Should toggle between light/dark mode
- [ ] Should update CSS class on body

**Implementation steps:**
1. Add toggle button to template
2. Add toggleDarkMode() method
3. Add CSS for dark mode styling
4. Store preference in localStorage

### 2. PWA INSTALLATION INSTRUCTIONS  
**Tests to write:**
- [ ] Should show device-specific instructions
- [ ] Should detect iOS/Android/Desktop
- [ ] Should display instructions in template

**Implementation steps:**
1. Create device detection service
2. Create getInstallInstructions() method
3. Add instructions template
4. Style for different devices

### 3. FOOTER NAVIGATION ICONS
**Tests to write:**
- [ ] Should have visible icons
- [ ] Should have correct icon names
- [ ] Should have active/inactive styling

**Implementation steps:**
1. Fix icon visibility (CSS)
2. Ensure correct icon names
3. Add active state styling
4. Test on different screen sizes

## 🚀 Quick Start Commands
```bash
# Run tests (headless, single run)
npm test

# Build for production
npm run build

# Deploy to public directory
npm run deploy
```

## 📝 Success Criteria
- [ ] All 3 features implemented
- [ ] Tests pass (simple but useful)
- [ ] Code is clean and maintainable
- [ ] Features work in production (admin.toybits.cloud)
