'use strict';
import { ConfigurationChangeEvent, Disposable, StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { configuration } from './configuration';
import { extensionId } from './constants';
import { Container } from './container';

export class StatusBarController implements Disposable {
	private _disposable: Disposable;
	private _statusBarItem: StatusBarItem | undefined;

	constructor() {
		this._disposable = Disposable.from(
			configuration.onDidChange(this.onConfigurationChanged, this),
			Container.filesExclude.onDidToggle(this._onExcludeToggled, this)
		);

		this.onConfigurationChanged(configuration.initializingChangeEvent);
	}

	dispose() {
		this._statusBarItem && this._statusBarItem.dispose();
		this._disposable && this._disposable.dispose();
	}

	private onConfigurationChanged(e: ConfigurationChangeEvent) {
		if (configuration.changed(e, 'statusBar', 'enabled')) {
			this._statusBarItem && this._statusBarItem.dispose();

			const canToggle = Container.filesExclude.canToggle;
			if (Container.config.statusBar.enabled && canToggle) {
				this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 0);
				this._statusBarItem.command = `${extensionId}.toggle`;
				this.updateStatusBarItem(Container.filesExclude.toggled);
				this._statusBarItem.show();
			}
		}
	}

	private updateStatusBarItem(toggled: boolean) {
		if (this._statusBarItem === undefined) return;

		this._statusBarItem.text = toggled ? '$(eye)\u2022' : '$(eye)';
		this._statusBarItem.tooltip = `${toggled ? 'Restore' : 'Show'} Excluded Files`;
	}

	private _onExcludeToggled() {
		if (this._statusBarItem === undefined) return;

		this.updateStatusBarItem(Container.filesExclude.toggled);
	}
}
