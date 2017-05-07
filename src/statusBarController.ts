'use strict';
import { Objects } from './system';
import { Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, window, workspace } from 'vscode';
import { Commands } from './commands';
import { IConfig } from './configuration';
import { ExtensionKey } from './constants';
import { FilesExcludeController } from './excludeController';

export class StatusBarController extends Disposable {

    private _config: IConfig;
    private _disposable: Disposable;
    private _statusBarItem: StatusBarItem | undefined;
    private _statusBarDisposable: Disposable | undefined;

    constructor(context: ExtensionContext, private filesExclude: FilesExcludeController) {
        super(() => this.dispose());

        this._onConfigurationChanged();

        const subscriptions: Disposable[] = [];

        subscriptions.push(workspace.onDidChangeConfiguration(this._onConfigurationChanged, this));
        subscriptions.push(filesExclude.onDidToggle(this._onExcludeToggled, this));

        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._statusBarDisposable && this._statusBarDisposable.dispose();
        this._statusBarItem && this._statusBarItem.dispose();
        this._disposable && this._disposable.dispose();
    }

    private _onConfigurationChanged() {
        const cfg = workspace.getConfiguration().get<IConfig>(ExtensionKey);
        if (cfg === undefined) return;

        const canToggle = this.filesExclude.canToggle;
        if (!Objects.areEquivalent(cfg.statusBar, this._config && this._config.statusBar) ||
            (canToggle && this._statusBarItem === undefined) || (!canToggle && this._statusBarItem !== undefined)) {
            this._statusBarItem && this._statusBarItem.dispose();

            if (cfg.statusBar.enabled && canToggle) {
                this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 0);
                this._statusBarItem.command = Commands.Toggle;
                this.updateStatusBarItem(this.filesExclude.toggled);
                this._statusBarItem.show();
            }
            else {
                this._statusBarItem = undefined;
            }
        }

        this._config = cfg;
    }

    private updateStatusBarItem(toggled: boolean) {
        if (this._statusBarItem === undefined) return;

        this._statusBarItem.text = toggled ? '$(eye)\u2022' : '$(eye)';
        this._statusBarItem.tooltip = `${toggled ? 'Restore' : 'Show'} Excluded Files`;
    }

    private _onExcludeToggled() {
        if (!this._statusBarItem) return;

        this.updateStatusBarItem(this.filesExclude.toggled);
    }
}