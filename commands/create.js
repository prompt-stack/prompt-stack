import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

export async function createCommand(projectName, options) {
  const spinner = ora('Creating your project...').start();
  
  try {
    // Check if directory exists
    if (fs.existsSync(projectName)) {
      spinner.fail(`Directory ${projectName} already exists`);
      return;
    }

    // Create project directory
    fs.mkdirSync(projectName);
    
    // Copy starter template
    const templatePath = path.join(import.meta.dirname, '..', 'templates', 'starter');
    await fs.copy(templatePath, projectName);
    
    // Update package.json with project name
    const packageJsonPath = path.join(projectName, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    
    spinner.succeed('Project created successfully!');
    
    // Show next steps
    console.log('\n' + chalk.bold('🚀 Next steps:'));
    console.log(chalk.gray(`   cd ${projectName}`));
    console.log(chalk.gray('   npm run setup         # Run initial setup'));
    console.log(chalk.gray('   npm run dev           # Start frontend only'));
    console.log(chalk.gray('   npm run dev:all       # Start frontend + backend'));
    
    console.log('\n' + chalk.bold('📂 Project Structure:'));
    console.log(chalk.gray('   frontend/   Next.js app'));
    console.log(chalk.gray('   backend/    FastAPI server'));
    console.log(chalk.gray('   supabase/   Database migrations'));
    console.log(chalk.gray('   scripts/    Helper scripts'));
    
    console.log('\n' + chalk.bold('📚 Want the full experience?'));
    console.log(chalk.cyan('   • Complete codebase ($97):'), chalk.underline('https://promptstack.com/code'));
    console.log(chalk.cyan('   • VIBE Framework training ($197):'), chalk.underline('https://promptstack.com/studio'));
    console.log(chalk.cyan('   • Bundle deal ($247):'), chalk.underline('https://promptstack.com/bundle'));
    
  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(error);
  }
}