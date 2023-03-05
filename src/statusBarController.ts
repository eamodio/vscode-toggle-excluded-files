import type { ConfigurationChangeEvent, StatusBarItem } from 'vscode';
import { Disposable, StatusBarAlignment, window } from 'vscode';
import { commandPrefix } from './constants';
import type { Container } from './container';
import { configuration } from './system/configuration';

export class StatusBarController implements Disposable {
	private _disposable: Disposable;
	private _statusBarItem: StatusBarItem | undefined;

	constructor(private readonly container: Container) {
		this._disposable = Disposable.from(
			configuration.onDidChangeAny(this.onConfigurationChanged, this),
			configuration.onDidChange(this.onConfigurationChanged, this),
			container.filesExclude.onDidToggle(this._onExcludeToggled, this),
		);

		this.onConfigurationChanged();
	}

	dispose() {
		this._statusBarItem?.dispose();
		this._disposable?.dispose();
	}

	private onConfigurationChanged(e?: ConfigurationChangeEvent) {
		if (e == null || configuration.changed(e, 'statusBar.enabled') || e.affectsConfiguration('files.exclude')) {
			this._statusBarItem?.dispose();

			const canToggle = this.container.filesExclude.canToggle;
			if (configuration.get('statusBar.enabled') && canToggle) {
				this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 0);
				this._statusBarItem.command = `${commandPrefix}.toggle`;
				this.updateStatusBarItem(this.container.filesExclude.toggled);
				this._statusBarItem.show();
			}
		}
	}

	private updateStatusBarItem(toggled: boolean) {
		if (this._statusBarItem == null) return;

		this._statusBarItem.text = toggled ? '$(eye)\u2022' : '$(eye)';
		this._statusBarItem.tooltip = `${toggled ? 'Restore' : 'Show'} Excluded Files`;
	}

	private _onExcludeToggled() {
		if (this._statusBarItem == null) return;

		this.updateStatusBarItem(this.container.filesExclude.toggled);
	}
}
