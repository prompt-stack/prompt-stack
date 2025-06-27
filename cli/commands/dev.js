const chalk = require('chalk');
const { exec } = require('shelljs');
const ora = require('ora');

async function devCommand(options) {
  console.log(chalk.blue('🚀 Starting Prompt-Stack development environment...'));
  console.log('');

  // Check if we're in a Prompt-Stack project
  if (!require('fs').existsSync('./Makefile') || !require('fs').existsSync('./setup.sh')) {
    console.error(chalk.red('❌ Not a Prompt-Stack project'));
    console.log(chalk.gray('Run this command from your project directory, or create a new project:'));
    console.log(chalk.gray('  prompt-stack create my-app'));
    process.exit(1);
  }

  const spinner = ora('Starting Docker services...').start();

  try {
    // Start development environment
    const result = exec('make dev', { silent: true });
    
    if (result.code !== 0) {
      spinner.fail('Failed to start development environment');
      console.error(chalk.red('Error:'));
      console.error(result.stderr);
      console.log('');
      console.log(chalk.yellow('💡 Try running:'));
      console.log(chalk.gray('  make clean && make dev'));
      process.exit(1);
    }

    spinner.succeed('Development environment started');

    // Wait a moment for services to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check service health
    const healthSpinner = ora('Checking service health...').start();
    
    // Simple health check - try to curl the backend
    const healthCheck = exec('curl -f http://localhost:8000/ > /dev/null 2>&1', { silent: true });
    
    if (healthCheck.code === 0) {
      healthSpinner.succeed('Services are healthy');
    } else {
      healthSpinner.warn('Services starting... (may take a moment)');
    }

    // Success message
    console.log('');
    console.log(chalk.green('✅ Development environment is running!'));
    console.log('');
    console.log(chalk.bold('🌐 Your application:'));
    console.log(chalk.blue('  Frontend: http://localhost:3000'));
    console.log(chalk.blue('  Backend:  http://localhost:8000'));
    console.log(chalk.blue('  API Docs: http://localhost:8000/docs'));
    console.log('');
    console.log(chalk.yellow('💡 Running in demo mode - add real API keys when ready'));
    console.log('');
    console.log(chalk.gray('To stop: Ctrl+C or run "make stop"'));

  } catch (error) {
    spinner.fail('Failed to start development environment');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

module.exports = devCommand;