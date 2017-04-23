## Release Notes

### 1.5.1
- Fixes marketplace badge layout

### 1.5.0
- Adds current toggle state (`Show` vs `Restore`) to the status bar button
- Adds folder (workspace) detection to disable of Toggle Exclude Files if a folder (workspace) is not loaded
- Changes status bar button to only appear if `files.exclude` is in use (either in user or workspace settings)
- Changes shortcut key for the `Toggle Excluded Files` command to only work when the file explorer is focused
- Renames `toggleexcludedfiles.advanced.debug` setting to `toggleexcludedfiles.debug`
- Renames `toggleexcludedfiles.output.level` setting to `toggleexcludedfiles.outputLevel`
- Fixes intermittent issue where restoring existing exclude rules failed

### 1.1.3
- Fixes issue with output channel logging

### 1.1.2
- Fixes intermittent issue with restoring the previous exclude rules

### 1.1.1
- Fixes logging to clean up on extension deactivate

### 1.1.0
- Completely refactored to save & restore existing exclude rules, even if they change while the toggle is active
- Fixes [#1](https://github.com/eamodio/vscode-toggle-excluded-files/issues/1) - Doesn't restore the original rules

### 1.0.1
- Updates the README and some dependencies

### 1.0.0
- No longer preview since vscode 1.8 has been released

### 0.0.1
- Initial release