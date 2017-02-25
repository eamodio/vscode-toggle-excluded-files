# Toggle Excluded Files

Quickly toggles excluded (hidden) files visibility in the file explorer.

![GitLens preview 1](https://raw.githubusercontent.com/eamodio/vscode-toggle-excluded-files/master/images/preview.gif)

## Features

- Provides commands to hide, show, and toggle excluded file visibility
- Provides (an optional) status bar button to toggle excluded file visibility

## Extension Settings

|Name | Description
|-----|------------
|`toggleexcludedfiles.statusBar.enabled`|Specifies whether to show a toggle button in the status bar

## VS Code excluded file settings

Excluded files are configured in your `settings.json`.

For example:
```
    "files.exclude": {
        "node_modules": true,
        "out": true
    }
```

## Known Issues

None
