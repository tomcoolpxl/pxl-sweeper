# PXL Sweep Project Rules

This repository builds the PXL Sweep game.

`REQUIREMENTS.md` is the current project truth.

## Testing Mandates

- **Test-Driven Development**: Every new feature, implementation, or bug fix MUST be accompanied by new tests (unit, integration, or both).
- **Comprehensive Coverage**: Maintain and track high code coverage (target >90%). Use `npm run test:coverage` to verify.
- **Requirement Traceability**: Tests must explicitly cover all functional requirements and acceptance criteria defined in `REQUIREMENTS.md`.
- **Always Run All Tests**: Both unit and integration tests must be executed and pass before any work is considered complete.
- **Environment**: Use Vitest with `jsdom` for all browser-related logic and DOM interaction verification.

## Project Workflow

- Keep work small enough for one review cycle.
- Stay inside the accepted requirements.
- Ask before broad refactors, test removal, or directory-structure changes.
- When `IMPLEMENTATION_PLAN.md`, `TODO.md`, and `DONE.md` exist, use them as the project-state workflow files.
- Use `IMPLEMENTATION_PHASE[N].md` as the immutable blueprint for each phase.
- **Runnable State**: Maintain a `package.json` with a `start` script.
- **Verification**: Always verify the "runnable" state via `npm start` before marking a task as done.
- Refresh `TODO.md` from the current plan phase.
- Update `TODO.md` and `DONE.md` after implementation.
- When `DONE.md` exists, it holds only verified work.
- adapt this file at the end of each implementation round!
