[![](https://vsmarketplacebadges.dev/version-short/amodio.toggle-excluded-files.svg)](https://marketplace.visualstudio.com/items?itemName=amodio.toggle-excluded-files)
[![](https://vsmarketplacebadges.dev/downloads-short/amodio.toggle-excluded-files.svg)](https://marketplace.visualstudio.com/items?itemName=amodio.toggle-excluded-files)
[![](https://vsmarketplacebadges.dev/rating-short/amodio.toggle-excluded-files.svg)](https://marketplace.visualstudio.com/items?itemName=amodio.toggle-excluded-files)
[![](https://img.shields.io/badge/vscode--dev--community-toggle--excluded--files-blue.svg?logo=slack&labelColor=555555)](https://vscode-slack.amod.io)

# Toggle Excluded Files

Quickly toggles excluded (hidden) files visibility in the file explorer.

> Excluded files are configured in your [`settings.json`](https://code.visualstudio.com/docs/getstarted/settings#_copy-of-default-settings)
>
> ```json
> "files.exclude": {
>     "node_modules": true,
>     "out": true
> }
> ```

![preview](https://raw.githubusercontent.com/eamodio/vscode-toggle-excluded-files/master/images/preview.gif)

## Features

- Adds a `Toggle Excluded Files` command (`toggleexcludedfiles.toggle`) with a shortcut of `ctrl+shift+a` (`cmd+shift+a` on macOS) to either show or restore the current visibility of excluded files in the file explorer

- Adds a **Explorer view button** to toggle the excluded file visibility ([optional](#extension-settings), on by default)
- Adds a **status bar button** to toggle the excluded file visibility ([optional](#extension-settings), on by default)

  - An indicator icon will show when the exclude visibility is currently toggled

- Adds a `Show Excluded Files` command (`toggleexcludedfiles.show`) to show excluded files in the file explorer

- Adds a `Hide Excluded Files` command (`toggleexcludedfiles.restore`) to hide (restore) excluded files in the file explorer

## Extension Settings

| Name                                    | Description                                                      |
| --------------------------------------- | ---------------------------------------------------------------- |
| `toggleexcludedfiles.explorer.enabled`  | Specifies whether to show the toggle button in the Explorer view |
| `toggleexcludedfiles.statusBar.enabled` | Specifies whether to show the toggle button in the status bar    |

## Known Issues

None
