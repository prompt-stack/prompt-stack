#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const pkg = require('../package.json');

// Import commands
const createCommand = require('../commands/create');
const devCommand = require('../commands/dev');
const statusCommand = require('../commands/status');

const program = new Command();

// CLI Header
console.log(chalk.blue('🚀 Prompt-Stack CLI'));
console.log(chalk.gray(`v${pkg.version} - AI-native full-stack template\n`));

program
  .name('prompt-stack')
  .description('CLI tool for creating and managing Prompt-Stack applications')
  .version(pkg.version);

// Commands
program
  .command('create')
  .description('Create a new Prompt-Stack project')
  .argument('<name>', 'project name')
  .option('-t, --template <template>', 'template variant', 'default')
  .action(createCommand);

program
  .command('dev')
  .description('Start development environment')
  .option('-p, --port <port>', 'frontend port', '3000')
  .action(devCommand);

program
  .command('status')
  .description('Check project status and health')
  .action(statusCommand);

// Additional commands for future
program
  .command('add')
  .description('Add integrations (supabase, ai, payments)')
  .argument('<service>', 'service to add (supabase|ai|stripe)')
  .action(() => {
    console.log(chalk.yellow('⚠️  Configuration commands coming in v1.1.0'));
    console.log(chalk.gray('For now, follow the setup guide in your project.'));
  });

program
  .command('doctor')
  .description('Diagnose common issues')
  .action(() => {
    console.log(chalk.yellow('⚠️  Diagnostic commands coming in v1.1.0'));
    console.log(chalk.gray('For now, run: ./scripts/diagnose.sh'));
  });

// Error handling
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.gray('Run "prompt-stack --help" for available commands.'));
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}