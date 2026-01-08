# Contributing to AI Dashboard Builder

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's coding standards

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/Krosebrook/AIDashboardBuilder.git
   cd AIDashboardBuilder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

## Development Workflow

### Running Locally

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Making Changes

1. **Write tests first** (TDD approach recommended)
2. **Implement your changes**
3. **Ensure all tests pass**
4. **Update documentation** if needed
5. **Commit with clear messages**

### Commit Messages

Follow conventional commits:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: code style changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

Examples:
```
feat: add support for GPT-4 Turbo model
fix: resolve token counting issue for long prompts
docs: update API documentation with examples
```

## Coding Standards

### TypeScript

- Use strict mode (enabled in tsconfig.json)
- Avoid `any` type
- Define interfaces for all data structures
- Use meaningful variable names
- Add JSDoc comments for public APIs

### React Components

- Use functional components
- Implement proper TypeScript typing
- Use hooks appropriately
- Memoize expensive computations
- Handle errors with error boundaries

### Testing

- Write unit tests for utilities and services
- Write integration tests for API routes
- Write E2E tests for critical user flows
- Aim for 70%+ code coverage
- Mock external dependencies

### Code Style

- Use Prettier for formatting (configured)
- Follow ESLint rules (configured)
- Use meaningful names
- Keep functions small and focused
- Add comments for complex logic

## Pull Request Process

1. **Update documentation** for any user-facing changes
2. **Add tests** for new features or bug fixes
3. **Ensure CI passes** (linting, tests, build)
4. **Update CHANGELOG.md** with your changes
5. **Request review** from maintainers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Lint and type checks pass
- [ ] Changelog updated
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── sections/         # Page sections
│   └── diagrams/         # Diagram components
├── lib/                   # Core libraries
│   ├── cache.ts          # Caching logic
│   ├── logger.ts         # Logging
│   └── retry.ts          # Retry logic
├── services/              # Business logic
│   ├── adapters/         # AI model adapters
│   └── orchestrator.ts   # Main orchestration
├── utils/                 # Utility functions
│   ├── sanitize.ts       # Input/output sanitization
│   └── tokens.ts         # Token counting
├── types/                 # TypeScript types
├── __tests__/            # Test files
└── docs/                  # Documentation
```

## Adding New Features

### Adding a New AI Provider

1. Create adapter in `services/adapters/`
2. Extend `BaseModelAdapter`
3. Implement required methods
4. Update `AIOrchestrator` to include adapter
5. Add tests
6. Update documentation

Example:

```typescript
// services/adapters/custom.ts
export class CustomAdapter extends BaseModelAdapter {
  readonly provider = 'custom' as const;
  readonly supportedModels = ['custom-model-1'];
  
  async complete(request: ModelRequest): Promise<ModelResponse> {
    // Implementation
  }
  
  async streamComplete(/* ... */) {
    // Implementation
  }
}
```

### Adding a New Diagram Type

1. Create component in `components/diagrams/`
2. Export from `Diagrams.tsx`
3. Update type definitions
4. Add lazy loading
5. Add tests
6. Update documentation

## Testing Guidelines

### Unit Tests

```typescript
describe('MyUtility', () => {
  it('should handle valid input', () => {
    const result = myFunction(validInput);
    expect(result).toBeDefined();
  });
  
  it('should reject invalid input', () => {
    expect(() => myFunction(invalidInput)).toThrow();
  });
});
```

### Integration Tests

```typescript
describe('API /api/ai/complete', () => {
  it('should return completion', async () => {
    const response = await fetch('/api/ai/complete', {
      method: 'POST',
      body: JSON.stringify({ messages: [/* ... */] }),
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

### E2E Tests

```typescript
test('user can generate AI completion', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="prompt"]', 'Test prompt');
  await page.click('[data-testid="submit"]');
  await expect(page.locator('[data-testid="response"]')).toBeVisible();
});
```

## Documentation

- Update README.md for major features
- Update API.md for API changes
- Update ARCHITECTURE.md for architectural changes
- Add JSDoc comments to code
- Include examples in documentation

## Security

- Never commit API keys or secrets
- Sanitize all user inputs
- Validate all API requests
- Follow OWASP guidelines
- Report security issues privately

## Questions?

- Open a discussion on GitHub
- Join our Discord server
- Email: support@aidashboard.dev

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
