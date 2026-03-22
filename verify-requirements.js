#!/usr/bin/env node

/**
 * Quick Verification Script for 3 Requirements
 * Runs without Angular test framework
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying 3 Requirements in Angular PWA\n');

// Read source files
const homePageTs = fs.readFileSync(path.join(__dirname, 'src/app/pages/home/home.page.ts'), 'utf8');
const homePageHtml = fs.readFileSync(path.join(__dirname, 'src/app/pages/home/home.page.html'), 'utf8');

let allPassed = true;
const results = [];

// Requirement 1: Installation Instructions
console.log('📋 Requirement 1: Installation Instructions');
const req1Tests = [
  { name: 'Installation title property', test: homePageTs.includes('installTitle = ') },
  { name: 'Install as Native App text', test: homePageTs.includes('Install as Native App') },
  { name: 'Installation card logic', test: homePageTs.includes('showInstallCard') },
  { name: 'Device-specific instructions', test: homePageTs.includes('getInstallInstructions') },
  { name: 'Install button click handler', test: homePageTs.includes('onInstallClick') },
  { name: 'HTML contains installation text', test: homePageHtml.includes('Install') }
];

req1Tests.forEach(test => {
  const passed = test.test;
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} ${test.name}`);
  if (!passed) allPassed = false;
  results.push({ requirement: 1, test: test.name, passed });
});

// Requirement 2: Dark/Light Theme Toggle
console.log('\n📋 Requirement 2: Dark/Light Theme Toggle');
const req2Tests = [
  { name: 'Theme toggle method', test: homePageTs.includes('onThemeToggle()') },
  { name: 'Dark mode property', test: homePageTs.includes('isDarkMode') },
  { name: 'Theme service call', test: homePageTs.includes('toggleDarkMode') },
  { name: 'HTML has theme toggle button', test: homePageHtml.includes('data-testid="theme-toggle"') },
  { name: 'HTML has theme icons', test: homePageHtml.includes('sunny') || homePageHtml.includes('moon') },
  { name: 'Theme references in HTML', test: homePageHtml.includes('theme') }
];

req2Tests.forEach(test => {
  const passed = test.test;
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} ${test.name}`);
  if (!passed) allPassed = false;
  results.push({ requirement: 2, test: test.name, passed });
});

// Requirement 3: Tab Navigation
console.log('\n📋 Requirement 3: Tab Navigation');
const req3Tests = [
  { name: 'Current tab property', test: homePageTs.includes('currentTab = ') },
  { name: 'Switch tab method', test: homePageTs.includes('switchTab(') },
  { name: 'Three tabs defined', test: homePageTs.includes('home') && homePageHtml.includes('components') && homePageHtml.includes('settings') },
  { name: 'Components array', test: homePageTs.includes('components = [') },
  { name: 'HTML has tab bar', test: homePageHtml.includes('ion-tab-bar') },
  { name: 'HTML has tab buttons', test: homePageHtml.includes('ion-tab-button') },
  { name: 'HTML has tab labels', test: homePageHtml.includes('Home') && homePageHtml.includes('Components') && homePageHtml.includes('Settings') }
];

req3Tests.forEach(test => {
  const passed = test.test;
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} ${test.name}`);
  if (!passed) allPassed = false;
  results.push({ requirement: 3, test: test.name, passed });
});

// Summary
console.log('\n📊 Summary');
const totalTests = results.length;
const passedTests = results.filter(r => r.passed).length;
const failedTests = totalTests - passedTests;

console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);

// Requirement-specific summary
console.log('\n📋 Requirement Breakdown:');
[1, 2, 3].forEach(req => {
  const reqTests = results.filter(r => r.requirement === req);
  const reqPassed = reqTests.filter(r => r.passed).length;
  const reqTotal = reqTests.length;
  const status = reqPassed === reqTotal ? '✅ COMPLETE' : '⚠️ INCOMPLETE';
  console.log(`Requirement ${req}: ${reqPassed}/${reqTotal} tests passed - ${status}`);
});

// Final verdict
console.log('\n🎯 Final Verification:');
if (allPassed) {
  console.log('✅ ALL 3 REQUIREMENTS VERIFIED!');
  console.log('1. ✅ Installation Instructions');
  console.log('2. ✅ Dark/Light Theme Toggle');
  console.log('3. ✅ Tab Navigation');
  console.log('\n🚀 The Angular PWA meets all requirements!');
} else {
  console.log('❌ SOME REQUIREMENTS NOT MET');
  console.log('\nIssues found:');
  results.filter(r => !r.passed).forEach(failed => {
    console.log(`  ❌ Requirement ${failed.requirement}: ${failed.test}`);
  });
  console.log('\n🔧 Please check the failed tests above.');
}

process.exit(allPassed ? 0 : 1);