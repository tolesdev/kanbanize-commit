// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, window, commands, workspace, } from 'vscode';
const Git = require('simple-git');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	const git = Git(workspace.rootPath);

	const commit = (messageParts: any[]) => git.commit(messageParts);
	const commitStaged = (messageParts: any[]) => git.commit(messageParts);
	const commitStagedAmend = (messageParts: any[]) => git.commit(messageParts, undefined, { '--amend': null });
	const commitAll = (messageParts: any[]) => git.commit(messageParts, undefined, { '-a': null });
	const commitAllAmend = (messageParts: any[]) => git.commit(messageParts, undefined, { '-a': null, '--amend': null });

	// @ts-ignore
	const preCommit = command => {
		// The code you place here will be executed every time your command is executed
		git.revparse(['--abbrev-ref', 'HEAD'], (currentBranch: string) => {
			window.showInputBox({
				ignoreFocusOut: true,
				placeHolder: 'chore: Adding additional logging',
				prompt: 'Commit Message'
			})
			// @ts-ignore
			.then((commitMessage: string) => {
				window.showInputBox({
					ignoreFocusOut: true,
					prompt: 'Commit Details'
				})
				// @ts-ignore
				.then((commitDetails: string) => {
					let kanbanizeId;
					if (currentBranch) {
						// @ts-ignore
						const [, id] = currentBranch.match(/[^\/]*([0-9]*)/);
						kanbanizeId = id;
					}

					window.showInputBox({
						ignoreFocusOut: true,
						placeHolder: '02022020',
						value: kanbanizeId,
						valueSelection: [0, 0],
						prompt: 'Kanbanize Card ID',
						// validateInput(value) {
						// 	if (/[0-9]*/.test(value)) {
						// 		return null;
						// 	}
						// 	// Return error message
						// 	return 'An invalid ID was .'
						// }
					})
					// @ts-ignore
					.then((kbnId: string) => {
						try {
							const cardId = `#id ${kbnId}`;
							command([commitMessage, commitDetails, cardId]);
							window.showInformationMessage(`Commit tagged with Kanbanize ID ${kbnId}`);
						}
						catch (e) {
							window.showErrorMessage(e);
						}
					})
				})
			})
		});
	}
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let commitDispose = commands.registerCommand('kbn-git.commit', () => preCommit(commit));
	let commitStagedDispose = commands.registerCommand('kbn-git.commitStaged', () => preCommit(commitStaged));
	let commitStagedAmendDispose = commands.registerCommand('kbn-git.commitStagedAmend', () => preCommit(commitStagedAmend));
	let commitAllDispose = commands.registerCommand('kbn-git.commitAll', () => preCommit(commitAll));
	let commitAllAmendDispose = commands.registerCommand('kbn-git.commitAllAmend', () => preCommit(commitAllAmend));

	context.subscriptions.push(commitDispose);
	context.subscriptions.push(commitStagedDispose);
	context.subscriptions.push(commitStagedAmendDispose);
	context.subscriptions.push(commitAllDispose);
	context.subscriptions.push(commitAllAmendDispose);
}

// this method is called when your extension is deactivated
export function deactivate() {}
