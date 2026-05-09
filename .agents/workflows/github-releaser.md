---
description: Automates the analysis of git commits, semantic versioning, and publishing of GitHub releases
---

# GitHub Release Workflow

Follow these steps to generate, version, and publish a new release for Listify.

### 1. Analysis Phase
- [ ] **Fetch latest tags**: Run `git fetch --tags` to ensure local tags are up to date.
- [ ] **Identify latest version**: Run `git tag --sort=-v:refname` and find the most recent tag (e.g., `v1.0.0`).
- [ ] **Analyze commits**: Run `git log <latest_tag>..HEAD --oneline` to see all changes since the last release.
- [ ] **Categorize changes**:
    - **Features**: Commits starting with `feat:`, `Add`, or `Introduce`.
    - **Fixes**: Commits starting with `fix:`, `Resolve`, or `Bug`.
    - **Refactors**: Commits starting with `refactor:`, `Cleanup`, or `Adjust`.

### 2. Versioning Phase
- [ ] **Determine next version**: Apply Semantic Versioning (SemVer) rules:
    - **Patch** (0.0.1): Minor bug fixes or internal refactors.
    - **Minor** (0.1.0): New features or significant UX improvements.
    - **Major** (1.0.0): Breaking changes or complete architectural shifts.
- [ ] **Propose Version**: Present the new version and a summary of changes to the user for approval.

### 3. Preparation Phase
- [ ] **Generate Release Notes**: Create a "Premium" markdown description including:
    - 🚀 Highlights
    - ✨ Features
    - 🛠️ Technical Improvements
    - 🐞 Bug Fixes
- [ ] **Update package.json**: Change the `"version"` field in `package.json` to the new version.
- [ ] **Update README.md*: Change the version badge from shields.io to the new version.

### 4. Execution Phase
- [ ] **Local Commit**: Run `git commit -am "chore(release): vX.Y.Z"`.
- [ ] **Tagging**: Run `git tag vX.Y.Z`.
- [ ] **Pushing**: Run `git push origin main --tags`.
- [ ] **GitHub Release**: Use the `mcp_github-mcp-server` to create an official release on GitHub using the new tag and generated notes.

### 5. Verification Phase
- [ ] **Verify Live Status**: Ensure the release is visible on the GitHub repository.
- [ ] **Cleanup**: Remove any temporary files or scratch scripts used during the process.