---
name: agent-auth-helper
description: Help the AI agent log into the application during local development using stored test credentials.
risk: low
source: local
date_added: '2026-05-09'
---

# Agent Authentication Helper

This skill provides instructions for the AI agent (you) to automatically log into the application at `localhost:5173`.

## Use this skill when

- You are redirected to the login page (`/login`).
- You need to perform actions that require an authenticated session.
- You are starting a browser session and want to ensure you are logged in.

## Instructions

1. **Check Authentication Status**:
   - Navigate to `http://localhost:5173/`.
   - Observe if you are redirected to `http://localhost:5173/u/1#/login` (or similar auth path) or if the UI shows guest-only elements.

2. **Retrieve Credentials**:
   - Read the file `file:///e:/Projects/listify/.agents/ai_agent_credentials.json`.
   - Extract the `email` and `password`.

3. **Perform Login**:
   - Go to `http://localhost:5173/u/1#/login`.
   - Use the `browser_subagent` to:
     - Type the `email` into the email input field.
     - Type the `password` into the password input field.
     - Click the "Login" (or equivalent) button.
   - Wait for the navigation to complete and verify you are on the dashboard/home page.

4. **Handle Errors**:
   - If the login fails (e.g., "Invalid credentials"), inform the USER and ask them to verify the contents of `ai_agent_credentials.json`.
   - Do NOT try to register a new account unless explicitly instructed by the USER.

## Purpose

To ensure the AI agent can consistently and efficiently access the authenticated parts of the application without manual intervention or redundant registration steps.

## Capabilities

- Automated login flow detection.
- Credential retrieval from a standardized local path.
- Browser-based form submission for authentication.

## Response Approach

1. Detect the need for authentication.
2. Signal to the USER that you are logging in using the `agent-auth-helper` skill.
3. Execute the login steps.
4. Confirm successful login before proceeding with the main task.
