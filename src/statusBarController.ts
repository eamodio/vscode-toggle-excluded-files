import type { ConfigurationChangeEvent, StatusBarItem } from 'vscode'
import { Disposable, StatusBarAlignment, window } from 'vscode'
import type { Commands, CoreConfiguration } from './constants'
import { extensionPrefix } from './constants'
import type { Container } from './container'
import { configuration } from './system/configuration'

export class StatusBarController implements Disposable {
	private _disposable: Disposable
	private _statusBarItem: StatusBarItem | undefined

	constructor(private readonly container: Container) {
		this._disposable = Disposable.from(
			configuration.onDidChangeAny(this.onAnyConfigurationChanged, this),
			container.filesExclude.onDidToggle(this._onExcludeToggled, this),
		)

		this.onAnyConfigurationChanged()
	}

	dispose() {
		this._statusBarItem?.dispose()
		this._disposable?.dispose()
	}

	private onAnyConfigurationChanged(e?: ConfigurationChangeEvent) {
		if (
			e == null ||
			configuration.changed(e, 'statusBar.enabled') ||
			configuration.changedAny<CoreConfiguration>(e, 'files.exclude')
		) {
			this._statusBarItem?.dispose()

			const { canToggle } = this.container.filesExclude
			if (configuration.get('statusBar.enabled') && canToggle) {
				this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 0)
				this._statusBarItem.command = `${extensionPrefix}.toggle` satisfies keyof Commands
				this.updateStatusBarItem(this.container.filesExclude.toggled)
				this._statusBarItem.show()
			}
		}
	}

	private updateStatusBarItem(toggled: boolean) {
		if (this._statusBarItem == null) return

		this._statusBarItem.text = toggled ? '$(eye-closed)' : '$(eye)'
		this._statusBarItem.tooltip = `${toggled ? 'Hide' : 'Show'} Excluded Files`
	}

	private _onExcludeToggled() {
		if (this._statusBarItem == null) return

		this.updateStatusBarItem(this.container.filesExclude.toggled)
	}
}
