/* eslint-disable */
const { execSync } = require('child_process');

const fs = require('fs');
const path = require('path');

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m%s\x1b[0m',    // Cyan
    success: '\x1b[32m%s\x1b[0m', // Green
    warning: '\x1b[33m%s\x1b[0m', // Yellow
    error: '\x1b[31m%s\x1b[0m'    // Red
  };
  console.log(colors[type], `[Pre-Flight] ${message}`);
}

async function runCheck() {
  log('Starting Pre-Deployment Audit...', 'info');

  try {
    // 1. Check Linting
    log('Checking for linting errors...', 'info');
    execSync('npm run lint', { stdio: 'inherit' });
    log('Linting passed!', 'success');

    // 2. Custom Check: Navigation Policy (target="_blank")
    log('Verifying Navigation Policy (target="_blank" for internal links)...', 'info');
    const filesToCheck = [
      'components/layout/navbar.tsx',
      'components/layout/footer.tsx',
      'components/sections/hero.tsx',
      'components/ui/vehicle-card.tsx'
    ];

    let navigationIssues = 0;
    filesToCheck.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        // Simple regex to check for Links without target="_blank"
        const linkRegex = /<Link(?!.*target="_blank")[^>]*href=["']\/(?!\/)[^"']*["'][^>]*>/g;
        const matches = content.match(linkRegex);
        if (matches) {
          log(`Warning: Found ${matches.length} link(s) without target="_blank" in ${file}`, 'warning');
          navigationIssues += matches.length;
        }
      }
    });

    if (navigationIssues === 0) {
      log('Navigation policy verified!', 'success');
    } else {
      log(`${navigationIssues} navigation warnings found. Please review before going live.`, 'warning');
    }

    // 3. Test Production Build
    log('Running production build test (this may take a minute)...', 'info');
    execSync('npm run build', { stdio: 'inherit' });
    log('Production build successful!', 'success');

    log('\n=======================================', 'success');
    log('🚀 ALL SYSTEMS GO! Ready for Vercel.', 'success');
    log('=======================================\n', 'success');

  } catch (error) {
    log('\n=======================================', 'error');
    log('❌ AUDIT FAILED. Fix errors before live.', 'error');
    log('=======================================\n', 'error');
    process.exit(1);
  }
}

runCheck();
