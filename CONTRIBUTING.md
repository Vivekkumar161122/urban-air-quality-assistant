# Contributing to Urban Air Quality Assistant

Thank you for your interest in contributing to the Urban Air Quality Assistant! We welcome community contributions focused on atmospheric science, indoor air quality hacks, accessibility improvements, and developer experience.

## Development Workflow

### 1. Requirements
- Node.js version 18.0.0 or higher.
- Git.

### 2. Local Setup
```bash
git clone https://github.com/your-username/urban-air-quality-assistant.git
cd urban-air-quality-assistant
npm test
npm start
```
The application runs locally at `http://localhost:3000`.

### 3. Guiding Principles
- **Zero Runtime Bloat**: Keep the core lightweight and platform-independent by using native Node.js APIs (`node:http`, `node:test`, ES modules) and standard Web APIs.
- **Scientific Grounding**: Any new IAQ hacks, air exchange rate formulas, or emission factors must cite peer-reviewed or official standards (e.g. EPA, WHO, Berkeley Earth, UC Davis).
- **Accessibility by Default**: Ensure all interactive elements comply with WCAG 2.1 AA (keyboard focusable, screen-reader announced, high contrast, non-color-dependent indicators).

### 4. Running Tests
Run the automated test suite before opening a pull request:
```bash
npm test
npm run test:coverage
```

### 5. Submitting Pull Requests
1. Create a feature branch: `git checkout -b feature/your-feature-name`.
2. Commit your changes with clear, descriptive messages.
3. Push to your branch and open a Pull Request using the provided PR template.
