const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('shelljs');
const ora = require('ora');

async function createCommand(name, options) {
  const projectPath = path.resolve(name);

  console.log(chalk.blue(`🚀 Creating new Prompt-Stack project: ${chalk.bold(name)}`));
  console.log('');

  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    console.error(chalk.red(`❌ Directory "${name}" already exists`));
    process.exit(1);
  }

  const spinner = ora('Downloading prompt-stack template...').start();

  try {
    // Clone the studio template from GitHub
    const cloneResult = exec(`git clone --depth 1 --filter=blob:none --sparse https://github.com/prompt-stack/prompt-stack.git "${projectPath}"`, { silent: true });
    
    if (cloneResult.code !== 0) {
      spinner.fail('Failed to download template');
      console.error(chalk.red('Error cloning repository:'));
      console.error(cloneResult.stderr);
      process.exit(1);
    }

    // Sparse checkout only the studio folder
    const sparseResult = exec(`cd "${projectPath}" && git sparse-checkout set studio && git checkout`, { silent: true });
    
    if (sparseResult.code !== 0) {
      spinner.fail('Failed to extract template');
      console.error(chalk.red('Error setting up template:'));
      console.error(sparseResult.stderr);
      process.exit(1);
    }

    // Move studio contents to root and clean up
    const moveResult = exec(`cd "${projectPath}" && mv studio/* . && mv studio/.* . 2>/dev/null || true && rm -rf studio .git`, { silent: true });
    
    spinner.succeed('Template downloaded and extracted');

    // Run setup script
    const setupSpinner = ora('Running initial setup...').start();
    const setupResult = exec(`cd "${projectPath}" && ./setup.sh`, { silent: true });
    
    if (setupResult.code !== 0) {
      setupSpinner.fail('Setup failed');
      console.error(chalk.red('Setup script failed:'));
      console.error(setupResult.stderr);
      process.exit(1);
    }
    
    setupSpinner.succeed('Initial setup complete');

    // Success message
    console.log('');
    console.log(chalk.green('✅ Project created successfully!'));
    console.log('');
    console.log(chalk.bold('Next steps:'));
    console.log(chalk.gray('  1.'), `cd ${name}`);
    console.log(chalk.gray('  2.'), 'prompt-stack dev');
    console.log('');
    console.log(chalk.blue('🌐 Your app will be running at:'));
    console.log(chalk.gray('  Frontend: http://localhost:3000'));
    console.log(chalk.gray('  Backend:  http://localhost:8000'));
    console.log(chalk.gray('  API Docs: http://localhost:8000/docs'));
    console.log('');
    console.log(chalk.yellow('💡 Tip: Start in demo mode, then add real services later'));

  } catch (error) {
    spinner.fail('Creation failed');
    console.error(chalk.red('Error creating project:'), error.message);
    process.exit(1);
  }
}

module.exports = createCommand;