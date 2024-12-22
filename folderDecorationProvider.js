const vscode = require("vscode");
const path = require("path");

class FolderDecorationProvider {
  constructor() {
    this._onDidChangeFileDecorations = new vscode.EventEmitter();
    this.onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;
    this.excludedFolders = new Set();
    this.loadExcludedFolders();

    // Watch for changes in configuration
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('search.exclude')) {
        this.loadExcludedFolders();
      }
    });
  }

  loadExcludedFolders() {
    const config = vscode.workspace.getConfiguration("search");
    const excluded = config.get("exclude", {});
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
    
    if (!workspacePath) {
      this.excludedFolders = new Set();
      return;
    }

    // Convert relative paths back to absolute paths
    this.excludedFolders = new Set(
      Object.entries(excluded)
        .filter(([_, value]) => value === true)
        .map(([key]) => {
          // Remove any /** pattern
          const cleanPath = key.replace(/\/\*\*$/, '');
          // Convert to absolute path
          return path.join(workspacePath, cleanPath);
        })
    );
  }

  provideFileDecoration(uri) {
    if (this.isExcluded(uri)) {
      return {
        color: new vscode.ThemeColor("disabledForeground"),
        propagate: true,
      };
    }
    return undefined;
  }

  isExcluded(uri) {
    // Check if the uri's path or any of its parent directories are excluded
    let currentPath = uri.fsPath;
    while (currentPath) {
      if (this.excludedFolders.has(currentPath)) {
        return true;
      }
      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) break; // We've reached the root
      currentPath = parentPath;
    }
    return false;
  }

  updateExcludedFolders(uri, excluded) {
    if (excluded) {
      this.excludedFolders.add(uri.fsPath);
    } else {
      this.excludedFolders.delete(uri.fsPath);
    }
    this._onDidChangeFileDecorations.fire(uri);
  }
}

module.exports = FolderDecorationProvider;
