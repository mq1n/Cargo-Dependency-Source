import * as vscode from 'vscode';
import axios from 'axios';

export async function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.languages.registerHoverProvider('toml', {
        async provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Hover | undefined> {
            const wordRange = document.getWordRangeAtPosition(position, /[\w-]+/);
            if (!wordRange) {
                return;
            }

            const dependencyName = document.getText(wordRange);
            if (!dependencyName) {
                return;
            }

            try {
                const response = await axios.get(`https://crates.io/api/v1/crates/${dependencyName}`);
                const crateData = response.data;

                const repositoryUrl = crateData.crate.repository;
                if (!repositoryUrl) {
                    return;
                }
                
                const crateLink = `https://crates.io/crates/${dependencyName}`;
                const sourceLink = `https://docs.rs/${dependencyName}`;

                const markdownString = new vscode.MarkdownString();
                markdownString.appendMarkdown(`**Crate:** [${dependencyName}](${crateLink})\n\n`);
                markdownString.appendMarkdown(`**Source:** [${dependencyName}](${sourceLink})\n\n`);
                markdownString.appendMarkdown(`**Repository:** [${dependencyName}](${repositoryUrl})`);

                const hoverRange = new vscode.Range(wordRange.start, wordRange.end);
                return new vscode.Hover(markdownString, hoverRange);
            } catch (error: any) {
                console.error(`Failed to fetch crate data for ${dependencyName} with error: ${error.message}}`);
                return;
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
