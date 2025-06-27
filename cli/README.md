# Prompt-Stack CLI

The command-line interface for creating and managing Prompt-Stack applications.

## Installation

```bash
npm install -g prompt-stack-cli
```

## Usage

### Create a new project
```bash
prompt-stack create my-saas-app
cd my-saas-app
```

### Start development
```bash
prompt-stack dev
```

### Check status
```bash
prompt-stack status
```

## Commands

| Command | Description |
|---------|-------------|
| `create <name>` | Create a new Prompt-Stack project |
| `dev` | Start development environment |
| `status` | Check project health and status |
| `add <service>` | Add integrations (coming v1.1.0) |
| `doctor` | Diagnose issues (coming v1.1.0) |

## Development

```bash
cd cli
npm install
npm run dev -- create test-app
```

## Publishing

```bash
cd cli
npm version patch
npm publish
```