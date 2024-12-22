const vscode = require("vscode");
const path = require("path");
const FolderDecorationProvider = require("./folderDecorationProvider");

function getExcludePattern(fsPath) {
  // Convert Windows path to forward slashes and make it relative to workspace
  const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
  if (!workspacePath) return null;

  let relativePath = path.relative(workspacePath, fsPath);
  relativePath = relativePath.replace(/\\/g, '/');
  
  // Create patterns to exclude the folder and all its contents
  return {
    [relativePath]: true,
    [`${relativePath}/**`]: true  // This ensures all subfolders and files are excluded
  };
}

function activate(context) {
  const decorationProvider = new FolderDecorationProvider();

  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(decorationProvider)
  );

  let excludeFolder = vscode.commands.registerCommand(
    "folder-exclude.excludeFolder",
    async (uri) => {
      if (!uri) {
        return;
      }

      try {
        const excludePatterns = getExcludePattern(uri.fsPath);
        if (!excludePatterns) {
          throw new Error("No workspace folder found");
        }

        // Only update search.exclude
        const searchConfig = vscode.workspace.getConfiguration("search");
        const searchExcluded = { ...searchConfig.get("exclude", {}) };
        Object.assign(searchExcluded, excludePatterns);
        
        await searchConfig.update(
          "exclude",
          searchExcluded,
          vscode.ConfigurationTarget.Workspace
        );

        decorationProvider.updateExcludedFolders(uri, true);
        await vscode.commands.executeCommand('setContext', 'folder-exclude.isExcluded', true);
      } catch (error) {
        console.error('Error excluding folder:', error);
        vscode.window.showErrorMessage(`Failed to exclude folder: ${error.message}`);
      }
    }
  );

  let includeFolder = vscode.commands.registerCommand(
    "folder-exclude.includeFolder",
    async (uri) => {
      if (!uri) {
        return;
      }

      try {
        const excludePatterns = getExcludePattern(uri.fsPath);
        if (!excludePatterns) {
          throw new Error("No workspace folder found");
        }

        // Remove from search.exclude
        const searchConfig = vscode.workspace.getConfiguration("search");
        const searchExcluded = { ...searchConfig.get("exclude", {}) };
        
        Object.keys(excludePatterns).forEach(pattern => {
          delete searchExcluded[pattern];
        });
        
        await searchConfig.update(
          "exclude",
          searchExcluded,
          vscode.ConfigurationTarget.Workspace
        );

        decorationProvider.updateExcludedFolders(uri, false);
        await vscode.commands.executeCommand('setContext', 'folder-exclude.isExcluded', false);
      } catch (error) {
        console.error('Error including folder:', error);
        vscode.window.showErrorMessage(`Failed to include folder: ${error.message}`);
      }
    }
  );

  context.subscriptions.push(excludeFolder, includeFolder);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
