const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('shelljs');
const ora = require('ora');

async function createCommand(name, options) {
  const projectPath = path.resolve(name);
  const templatePath = path.join(__dirname, '../../template');

  console.log(chalk.blue(`🚀 Creating new Prompt-Stack project: ${chalk.bold(name)}`));
  console.log('');

  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    console.error(chalk.red(`❌ Directory "${name}" already exists`));
    process.exit(1);
  }

  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    console.error(chalk.red('❌ Template not found. Make sure you\'re running from the correct directory.'));
    process.exit(1);
  }

  const spinner = ora('Copying template files...').start();

  try {
    // Copy template to new directory
    await fs.copy(templatePath, projectPath);
    spinner.succeed('Template files copied');

    // Run setup script
    const setupSpinner = ora('Running initial setup...').start();
    const setupResult = exec(`cd ${projectPath} && ./setup.sh`, { silent: true });
    
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