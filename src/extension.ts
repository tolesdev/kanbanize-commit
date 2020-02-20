// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, window, commands, workspace, ProgressLocation, Progress, CancellationToken, } from 'vscode';
// const Git = require('simple-git/promise');
import Git from 'simple-git/promise';

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
	const preCommit = command => new Promise((resolve, reject) => {
		// The code you place here will be executed every time your command is executed
		git.revparse(['--abbrev-ref', 'HEAD']).then(currentBranch => {

			const commitOpts = {
				ignoreFocusOut: true,
				placeHolder: 'chore: Adding additional logging',
				prompt: 'Commit Message'
			};

			// #1 Prompt for first commit message
			window.showInputBox(commitOpts).then(commitMessage => {
				const detailsOpts = {
					ignoreFocusOut: true,
					prompt: 'Commit Details'
				};

				// #2 Prompt for details commit message
				// @ts-ignore
				window.showInputBox(detailsOpts).then((commitDetails: string) => {
					let kanbanizeId;

					if (currentBranch) {
						// @ts-ignore
						const [id] = currentBranch.match(/[0-9]+/);
						kanbanizeId = id;
					}

					const idOpts = {
						value: kanbanizeId,
						ignoreFocusOut: true,
						placeHolder: '02022020',
						prompt: 'Kanbanize Card ID',
						validateInput(value: string) {
							if (/^[0-9]*$/.test(value)) {
								return null;
							}
							// Return error message
							return 'ID may only contain numbers.'
						}
					};
					// #3 Prompt for work item id
					window.showInputBox(idOpts).then(kbnId => {
						try {
							const cardId = `#id ${kbnId}`;
							const commitProgressOpts = {
								location: ProgressLocation.SourceControl,
								title: 'Git Commit'
							};

							const progressHandler = (progress: Progress<{ message?: string, increment?: number }>, token: CancellationToken) => new Promise((resolve, reject) =>
								// @ts-ignore
								command([commitMessage, commitDetails, cardId]).then(error => {
									if (!error) {
										resolve(`Commit tagged with Kanbanize ID: ${kbnId}`);
									}
									else {
										reject(`Failed to successfully commit files. ${error}`);
									}
								})
							);

							window.withProgress(commitProgressOpts, progressHandler).then(
								message => {
									window.showInformationMessage(message as string);
								},
								error => {
									window.showErrorMessage(error.message);
								}
							);
						}
						catch (e) {
							window.showErrorMessage(e);
						}
					})
				})
			})
		})
	});

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
