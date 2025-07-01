import chalk from 'chalk';
import { execSync } from 'child_process';

export function doctorCommand() {
  console.log(chalk.bold('\n🔍 Checking your environment...\n'));
  
  const checks = [
    {
      name: 'Node.js',
      command: 'node --version',
      minVersion: '18.0.0',
      required: true
    },
    {
      name: 'npm',
      command: 'npm --version',
      minVersion: '8.0.0',
      required: true
    },
    {
      name: 'Git',
      command: 'git --version',
      required: true
    },
    {
      name: 'Docker',
      command: 'docker --version',
      required: false
    }
  ];
  
  let hasErrors = false;
  
  checks.forEach(check => {
    try {
      const version = execSync(check.command, { encoding: 'utf8' }).trim();
      console.log(chalk.green('✓'), chalk.bold(check.name), chalk.gray(version));
    } catch (error) {
      if (check.required) {
        console.log(chalk.red('✗'), chalk.bold(check.name), chalk.red('Not found (required)'));
        hasErrors = true;
      } else {
        console.log(chalk.yellow('⚠'), chalk.bold(check.name), chalk.yellow('Not found (optional)'));
      }
    }
  });
  
  console.log('');
  
  if (hasErrors) {
    console.log(chalk.red('❌ Some required tools are missing'));
    console.log(chalk.gray('   Please install them before continuing'));
  } else {
    console.log(chalk.green('✨ Everything looks good!'));
    console.log(chalk.gray('   You\'re ready to create your first project'));
  }
  
  console.log('\n' + chalk.bold('📖 Documentation:'), chalk.underline('https://promptstack.com/docs'));
}