## Summary

This release focuses on authentication stability and UI performance improvements. Session persistence has been extended to one year, and the records title input has been optimized to prevent UI lag during typing.

## Bug Fixes

- Fixed authentication session persistence by extending refresh token expiration to 1 year
- Resolved cookie path issues for consistent refresh token delivery
- Added session invalidation on login to prevent stale session data

## Performance

- Decoupled title input from store to eliminate UI lag when typing in the records view

## Technical Notes

- Removed RELEASE_NOTES.md as release documentation is now managed through GitHub Releases
- Updated environment configuration to reflect new JWT refresh token expiration settings