const vscode = require("vscode");
const path = require("path");

class FolderDecorationProvider {
  constructor() {
    this._onDidChangeFileDecorations = new vscode.EventEmitter();
    this.onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

    // Watch for changes in configuration
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('search.exclude')) {
        this._onDidChangeFileDecorations.fire();
      }
    });
  }

  provideFileDecoration(uri) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
    if (!workspacePath || !uri.fsPath.startsWith(workspacePath)) {
      return undefined;
    }

    const relativePath = path.relative(workspacePath, uri.fsPath).replace(/\\/g, '/');
    const config = vscode.workspace.getConfiguration("search");
    const excludedPaths = config.get("exclude", {});

    if (excludedPaths[relativePath] === true) {
      return {
        color: new vscode.ThemeColor("disabledForeground")
      };
    }
    return undefined;
  }
}

module.exports = FolderDecorationProvider;
