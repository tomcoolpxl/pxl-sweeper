# CI/CD Strategy - PXL Sweeper

This document defines the Continuous Integration (CI) and Continuous Deployment (CD) strategy for PXL Sweeper using GitHub Actions.

## Overview
The pipeline is designed to ensure code quality, security, and automated delivery to **GitHub Pages**.

### Pipeline Stages
1.  **CI (Continuous Integration)**: Triggered on every Push and Pull Request to `main`.
    -   **Lint**: Enforces style and syntax rules via ESLint.
    -   **Test**: Runs the full Vitest suite (Unit + Integration).
    -   **Security**: Performs `npm audit` to identify vulnerable dependencies.
2.  **CD (Continuous Deployment)**: Triggered only on **Release Tags** (e.g., `v1.0.0`).
    -   **Build**: Prepares the `dist/` artifact.
    -   **Deploy**: Uploads and deploys the artifact directly to **GitHub Pages** (via the modern Action-based source).

---

## Workflows

### 1. Continuous Integration (`ci.yml`)
Runs on `push` to `main` and all `pull_request`.
- **Primary Goal**: Gatekeeper for `main` branch stability.
- **Tools**: Node.js 20, npm, Vitest, ESLint.

### 2. Continuous Deployment (`cd.yml`)
Runs on `release` (published).
- **Primary Goal**: Deliver a verified production version to the web.
- **Target**: [https://tomc.github.io/pxl-sweeper/](https://tomc.github.io/pxl-sweeper/) (Update based on real repo).
- **Environment**: Uses GitHub Environments for deployment tracking.

---

## Security Mandates
- **Least Privilege**: Workflows use minimal GITHUB_TOKEN permissions (`contents: read`, `pages: write`, `id-token: write`).
- **Audit**: `npm audit` is mandatory and must pass before deployment.
- **Immutability**: Deployment is tied to specific **Release Tags**, ensuring exactly what is reviewed is what is deployed.

## Local Verification
Before pushing, developers should run the following to simulate CI locally:
```bash
npm run lint && npm test && npm audit
```

## How to Trigger a Deployment
1.  Verify the current `main` branch passes CI.
2.  Create a new **Release** in GitHub (e.g., Tag: `v1.1.0`).
3.  GitHub Actions will automatically build and deploy to the production URL.
