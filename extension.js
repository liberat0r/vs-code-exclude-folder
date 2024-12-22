const vscode = require("vscode");
const path = require("path");
const FolderDecorationProvider = require("./folderDecorationProvider");

// Keep track of excluded folders in memory
let excludedFolders = [];

function activate(context) {
  const decorationProvider = new FolderDecorationProvider();
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(decorationProvider)
  );

  // Update context for all folders when configuration changes
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("search.exclude")) {
      updateExcludedFoldersContext();
    }
  });

  // Initial context setup
  updateExcludedFoldersContext();

  let excludeFolder = vscode.commands.registerCommand(
    "folder-exclude.excludeFolder",
    async (uri) => {
      if (!uri) return;

      try {
        const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
        if (!workspacePath) return;

        const relativePath = path
          .relative(workspacePath, uri.fsPath)
          .replace(/\\/g, "/");
        const folderName = path.basename(uri.fsPath);
        console.log("Excluding folder:", relativePath);

        const config = vscode.workspace.getConfiguration("search");
        const excludedPaths = { ...config.get("exclude", {}) };
        excludedPaths[relativePath] = true;
        excludedPaths[`${relativePath}/**`] = true;

        await config.update(
          "exclude",
          excludedPaths,
          vscode.ConfigurationTarget.Workspace
        );
        
        // Update the excluded folders array
        if (!excludedFolders.includes(folderName)) {
          excludedFolders.push(folderName);
          await vscode.commands.executeCommand('setContext', 'folder-exclude', excludedFolders);
          console.log("Updated excluded folders:", excludedFolders);
        }
      } catch (error) {
        console.error("Error excluding folder:", error);
      }
    }
  );

  let includeFolder = vscode.commands.registerCommand(
    "folder-exclude.includeFolder",
    async (uri) => {
      if (!uri) return;

      try {
        const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
        if (!workspacePath) return;

        const relativePath = path
          .relative(workspacePath, uri.fsPath)
          .replace(/\\/g, "/");
        const folderName = path.basename(uri.fsPath);
        console.log("Including folder:", relativePath);

        const config = vscode.workspace.getConfiguration("search");
        const excludedPaths = { ...config.get("exclude", {}) };
        delete excludedPaths[relativePath];
        delete excludedPaths[`${relativePath}/**`];

        await config.update(
          "exclude",
          excludedPaths,
          vscode.ConfigurationTarget.Workspace
        );
        
        // Update the excluded folders array
        excludedFolders = excludedFolders.filter(name => name !== folderName);
        await vscode.commands.executeCommand('setContext', 'folder-exclude', excludedFolders);
        console.log("Updated excluded folders:", excludedFolders);
      } catch (error) {
        console.error("Error including folder:", error);
      }
    }
  );

  context.subscriptions.push(excludeFolder, includeFolder);
}

async function updateExcludedFoldersContext() {
  const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
  if (!workspacePath) return;

  const config = vscode.workspace.getConfiguration("search");
  const excludedPaths = config.get("exclude", {});

  // Get all folders in workspace
  const folders = await vscode.workspace.findFiles("**/");
  
  // Create a set of existing folder names for faster lookup
  const existingFolders = new Set(excludedFolders);
  
  // Check each folder in the workspace
  for (const folder of folders) {
    const relativePath = path
      .relative(workspacePath, folder.fsPath)
      .replace(/\\/g, "/");
    if (excludedPaths[relativePath] === true) {
      const folderName = path.basename(folder.fsPath);
      if (!existingFolders.has(folderName)) {
        excludedFolders.push(folderName);
      }
    }
  }

  await vscode.commands.executeCommand('setContext', 'folder-exclude', excludedFolders);
  console.log("Current excluded folders:", excludedFolders);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
