'use strict';
import { ExtensionContext } from 'vscode';
import { HideCommand, ShowCommand, ToggleCommand } from './commands';
import ExcludeController from './excludeController';
import StatusBarController from './statusBarController';

// this method is called when your extension is activated
export async function activate(context: ExtensionContext) {
    const statusBarController = new StatusBarController(context);
    context.subscriptions.push(statusBarController);

    const excludeController = new ExcludeController(context);
    context.subscriptions.push(excludeController);

    context.subscriptions.push(new HideCommand(excludeController));
    context.subscriptions.push(new ShowCommand(excludeController));
    context.subscriptions.push(new ToggleCommand(excludeController));
}

// this method is called when your extension is deactivated
export function deactivate() { }