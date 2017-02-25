'use strict';
import { Objects } from './system';
import { Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, window, workspace } from 'vscode';
import { IConfig } from './configuration';
import { Commands } from './commands';

export default class StatusBarController extends Disposable {

    private _config: IConfig;
    private _disposable: Disposable;
    private _statusBarItem: StatusBarItem | undefined;
    private _statusBarDisposable: Disposable | undefined;

    constructor(context: ExtensionContext) {
        super(() => this.dispose());

        this._onConfigurationChanged();

        const subscriptions: Disposable[] = [];

        subscriptions.push(workspace.onDidChangeConfiguration(this._onConfigurationChanged, this));

        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._statusBarDisposable && this._statusBarDisposable.dispose();
        this._statusBarItem && this._statusBarItem.dispose();
        this._disposable && this._disposable.dispose();
    }

    private _onConfigurationChanged() {
        const config = workspace.getConfiguration('').get<IConfig>('toggleexcludedfiles');

        if (!Objects.areEquivalent(config.statusBar, this._config && this._config.statusBar)) {
            this._statusBarItem && this._statusBarItem.dispose();

            if (config.statusBar.enabled) {
                this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 0);
                this._statusBarItem.command = Commands.Toggle;
                this._statusBarItem.text = `$(eye)`;
                this._statusBarItem.tooltip = 'Toggle Excluded Files in Explorer';
                this._statusBarItem.show();
            }
            else {
                this._statusBarItem = undefined;
            }
        }

        this._config = config;
    }
}