# v1.3.2

## Summary

This release stabilizes the authentication system with a dual-token strategy, JWT-based refresh tokens, and multiple fixes for session management and cookie handling.

## What's New

- Authentication now uses a dual-token strategy with localStorage fallback for cross-origin reliability
- Refresh tokens migrated to JWT format for improved security and scalability
- Added uid cookie support with backward-compatible token rotation

## Bug Fixes

- Fixed signed cookies not being properly cleared on logout
- Fixed session invalidation on login with localStorage persistence
- Fixed parseInt issue on UUID user IDs during refresh token rotation

## Technical Notes

- Breaking change: Refresh tokens are now JWT-formatted. Existing sessions may require re-authentication.
- Performance improvement: Decoupled title input from store to prevent UI lag in records
