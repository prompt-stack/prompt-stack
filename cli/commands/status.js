const chalk = require('chalk');
const { exec } = require('shelljs');

async function statusCommand() {
  console.log(chalk.blue('📊 Prompt-Stack Project Status'));
  console.log('');

  // Check if we're in a Prompt-Stack project
  if (!require('fs').existsSync('./Makefile') || !require('fs').existsSync('./setup.sh')) {
    console.error(chalk.red('❌ Not a Prompt-Stack project'));
    console.log(chalk.gray('Run this command from your project directory'));
    process.exit(1);
  }

  // Check Docker status
  console.log(chalk.bold('🐳 Docker Services:'));
  const dockerCheck = exec('docker-compose ps', { silent: true });
  if (dockerCheck.code === 0) {
    console.log(dockerCheck.stdout);
  } else {
    console.log(chalk.red('  ❌ Docker services not running'));
    console.log(chalk.gray('     Run: prompt-stack dev'));
  }
  console.log('');

  // Check backend health
  console.log(chalk.bold('🔧 Backend Health:'));
  const backendCheck = exec('curl -f http://localhost:8000/ 2>/dev/null', { silent: true });
  if (backendCheck.code === 0) {
    try {
      const healthData = JSON.parse(backendCheck.stdout);
      console.log(chalk.green('  ✅ Backend online'));
      console.log(chalk.gray(`     Environment: ${healthData.data.environment}`));
      console.log(chalk.gray(`     Demo mode: ${healthData.data.demo_mode}`));
      console.log(chalk.gray(`     Version: ${healthData.data.version}`));
      
      // Show enabled features
      const features = healthData.data.features;
      console.log(chalk.gray('     Features:'));
      Object.entries(features).forEach(([name, enabled]) => {
        const icon = enabled ? '✅' : '⭕';
        console.log(chalk.gray(`       ${icon} ${name}`));
      });
    } catch (e) {
      console.log(chalk.yellow('  ⚠️  Backend responding but health data malformed'));
    }
  } else {
    console.log(chalk.red('  ❌ Backend not responding'));
    console.log(chalk.gray('     Check: http://localhost:8000'));
  }
  console.log('');

  // Check frontend
  console.log(chalk.bold('🌐 Frontend:'));
  const frontendCheck = exec('curl -f http://localhost:3000/ > /dev/null 2>&1', { silent: true });
  if (frontendCheck.code === 0) {
    console.log(chalk.green('  ✅ Frontend online'));
    console.log(chalk.gray('     URL: http://localhost:3000'));
  } else {
    console.log(chalk.red('  ❌ Frontend not responding'));
    console.log(chalk.gray('     Check: http://localhost:3000'));
  }
  console.log('');

  // Quick tips
  console.log(chalk.bold('💡 Quick Commands:'));
  console.log(chalk.gray('  prompt-stack dev    # Start development'));
  console.log(chalk.gray('  make logs          # View logs'));
  console.log(chalk.gray('  make stop          # Stop services'));
  console.log(chalk.gray('  ./scripts/diagnose.sh  # Full diagnostics'));
}

module.exports = statusCommand;