// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, window, commands, workspace, } from 'vscode';
const Git = require('simple-git');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "commit-kanbanize-id" is now active!');
	const git = Git(workspace.rootPath);


	// commands.executeCommand('editor.action.codeAction', )

	// const kbnScm = vscode.scm.createSourceControl('kbn', 'Kanbanize', vscode.Uri.parse(vscode.workspace.rootPath as string));
	// const kbnChanges = kbnScm.createResourceGroup('changes', 'CHANGES');
	// kbnChanges.resourceStates.push({
	// 	resourceUri: vscode.Uri.
	// })

	// kbnScm.acceptInputCommand =
	// const kbnIdInput = window.createInputBox();

	// kbnIdInput.
	// kbnIdInput.
	// vscode.window.showInputBox({
	// 	ignoreFocusOut: true,
	// 	prompt: 'Kanbanize Card ID',
		// placeHolder: '02022020',
		// validateInput(value) {
		// 	// Match0.

		// 	if (/[0-9]*/.test(value)) {
		// 		return null;
		// 	}
		// 	// Return error message
		// 	return 'Please enter a valid integer.'
		// }
	// })
	// .then(err => {
	// 	if (err) {
	// 		vscode.window.showErrorMessage(err);
	// 	}
	// })

	const commit = (messageParts: any[]) => git.commit(messageParts);

	const preCommit = command => {
		// The code you place here will be executed every time your command is executed
		git.revparse(['--abbrev-ref', 'HEAD'], (currentBranch: string) => {
			window.showInputBox({
				ignoreFocusOut: true,
				placeHolder: 'chore: Adding additional logging',
				prompt: 'Commit Message'
			})
			.then((commitMessage: string) => {
				window.showInputBox({
					ignoreFocusOut: true,
					prompt: 'Commit Details'
				})
				.then((commitDetails: string) => {
					let kanbanizeId;
					if (currentBranch) {
						// @ts-ignore
						const [, id] = currentBranch.match(/[^\/]*([0-9]*)/);
						const kanbanizeId = id;
					}

					window.showInputBox({
						ignoreFocusOut: true,
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
	let disposable = commands.registerCommand('kbn-git.commit', () => {
		preCommit(commit);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
