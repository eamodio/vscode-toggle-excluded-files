'use strict';
import { ExtensionContext } from 'vscode';
import { HideCommand, ShowCommand, ToggleCommand } from './commands';
import StatusBarController from './statusBarController';

// this method is called when your extension is activated
export async function activate(context: ExtensionContext) {
    const statusBarController = new StatusBarController(context);
    context.subscriptions.push(statusBarController);

    context.subscriptions.push(new HideCommand());
    context.subscriptions.push(new ShowCommand());
    context.subscriptions.push(new ToggleCommand());
}

// this method is called when your extension is deactivated
export function deactivate() { }