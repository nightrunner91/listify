## Summary

This release introduces season and episode tracking for records, improves activity timeline performance with soft-delete and pagination, and resolves several race conditions in the record save flow.

## What's New

### Season & Episode Tracking
- Add season and episode fields to records
- Support season & episode in import/export workflows
- Display episode info in record UI
- Add episode increment activity logging with full i18n support

### Activity Timeline
- Conditionally render activity timeline on public profiles
- Add soft-delete and pagination for activities
- Remove custom list activity logging and filtering

### Custom Lists
- Add privacy tooltip with translations

### Translations
- Add confirm/cancel translations and popconfirm labels

## Bug Fixes

- Prevent race condition in record save watcher
- Preserve object identity on record save to prevent input blur
- Save title changes on blur/select instead of watch
- Add debounced local state for season/episode inputs
- Persist session across browser restarts and idle/close
- Record input fixes, paste handling & cleanup
