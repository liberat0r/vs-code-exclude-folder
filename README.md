# Folder Exclude

A Visual Studio Code extension that allows you to temporarily exclude folders from search results with visual feedback.

## Features

- Right-click any folder to exclude it from search results
- Excluded folders are grayed out for clear visual feedback
- Folders remain visible in the explorer but their contents won't appear in search results
- Right-click excluded folders to include them again
- Settings persist across VS Code sessions

## Usage

1. Right-click any folder in the Explorer
2. Select "Exclude Folder" to exclude it from search results
   - The folder will be grayed out
   - Its contents won't appear in search results or Quick Open
3. To include the folder again:
   - Right-click the excluded folder
   - Select "Include Folder"

## Extension Settings

This extension contributes to the following VS Code settings:

- `search.exclude`: Manages the patterns for excluding files and folders from search results

## Known Issues

None at this time.

## Release Notes

### 0.0.6

Initial release:

- Basic exclude/include functionality
- Visual feedback for excluded folders
- Context menu integration
