import type { ConfigurationChangeEvent, Disposable, Event } from 'vscode';
import { ConfigurationTarget, EventEmitter } from 'vscode';
import type { CoreConfiguration } from './constants';
import type { Container } from './container';
import { setContext } from './context';
import type { Storage, StoredFilesExcludes } from './storage';
import { configuration } from './system/configuration';
import { Logger } from './system/logger';
import { areEqual } from './system/object';

export type FilesExcludeConfiguration = Record<string, boolean>;

export class FilesExcludeController implements Disposable {
	private _onDidToggle = new EventEmitter<void>();
	get onDidToggle(): Event<void> {
		return this._onDidToggle.event;
	}

	private readonly _disposable: Disposable;
	private _working: boolean = false;

	constructor(private readonly container: Container, private readonly storage: Storage) {
		this._disposable = configuration.onDidChangeAny(this.onAnyConfigurationChanged, this);
		this.onAnyConfigurationChanged();
	}

	dispose() {
		this._disposable.dispose();
	}

	private onAnyConfigurationChanged(e?: ConfigurationChangeEvent) {
		if (this._working) return;
		if (e != null && !configuration.changedAny<CoreConfiguration>(e, 'files.exclude')) return;

		const savedExclude = this.getSavedExcludeConfiguration();
		if (savedExclude == null) return;

		Logger.log('FilesExcludeController.onOtherConfigurationChanged()');

		const newExclude = this.getExcludeConfiguration();
		if (
			newExclude != null &&
			areEqual(savedExclude.globalValue, newExclude.globalValue) &&
			areEqual(savedExclude.workspaceValue, newExclude.workspaceValue)
		) {
			return;
		}

		const appliedExclude = this.getAppliedExcludeConfiguration();
		if (
			newExclude != null &&
			appliedExclude != null &&
			areEqual(appliedExclude.globalValue, newExclude.globalValue) &&
			areEqual(appliedExclude.workspaceValue, newExclude.workspaceValue)
		) {
			return;
		}

		Logger.log('FilesExcludeController.onOtherConfigurationChanged()', 'clearing state');

		// Remove the currently saved config, since it was directly edited
		void this.clearExcludeConfiguration();
	}

	async applyConfiguration() {
		// If we have saved state, the we are already applied to exit
		if (this._working || this.hasSavedExcludeConfiguration()) return;

		Logger.log('FilesExcludeController.applyConfiguration()');

		try {
			this._working = true;

			const exclude = this.getExcludeConfiguration()!;
			await this.saveExcludeConfiguration(exclude);

			const appliedExcludes: StoredFilesExcludes = {
				key: exclude.key,
				globalValue: exclude.globalValue == null ? undefined : {},
				workspaceValue: exclude.workspaceValue == null ? undefined : {},
				// workspaceFolderValue: exclude.workspaceFolderValue == null ? undefined : {},
			};

			const promises: Thenable<void>[] = [];

			if (exclude.globalValue != null && appliedExcludes.globalValue != null) {
				const apply: FilesExcludeConfiguration = Object.create(null);
				for (const key of Object.keys(exclude.globalValue)) {
					appliedExcludes.globalValue[key] = apply[key] = false;
				}

				promises.push(
					configuration.updateAny<CoreConfiguration, FilesExcludeConfiguration>(
						'files.exclude',
						apply,
						ConfigurationTarget.Global,
					),
				);
			}

			if (exclude.workspaceValue != null && appliedExcludes.workspaceValue != null) {
				const apply: FilesExcludeConfiguration = Object.create(null);
				for (const key of Object.keys(exclude.workspaceValue)) {
					appliedExcludes.workspaceValue[key] = apply[key] = false;
				}

				promises.push(
					configuration.updateAny<CoreConfiguration, FilesExcludeConfiguration>(
						'files.exclude',
						apply,
						ConfigurationTarget.Workspace,
					),
				);
			}

			// if (exclude.workspaceFolderValue != null && appliedExclude.workspaceFolderValue != null) {
			// 	const apply = Object.create(null);
			// 	for (const key of Object.keys(exclude.workspaceFolderValue)) {
			// 		appliedExclude.workspaceFolderValue[key] = apply[key] = false;
			// 	}

			// 	promises.push(configuration.updateAny(this._section, apply, ConfigurationTarget.WorkspaceFolder));
			// }

			await this.saveAppliedExcludeConfiguration(appliedExcludes);

			if (!promises.length) return;

			await Promise.allSettled(promises);
		} catch (ex) {
			Logger.error(ex);
			await this.clearExcludeConfiguration();
		} finally {
			Logger.log('FilesExcludeController.applyConfiguration()', 'done');

			this._working = false;
			this._onDidToggle.fire();
		}
	}

	async restoreConfiguration() {
		// If we don't have saved state, the we don't have anything to restore so exit
		if (this._working || !this.hasSavedExcludeConfiguration()) return;

		Logger.log('FilesExcludeController.restoreConfiguration()');

		try {
			this._working = true;
			const excludes = this.getSavedExcludeConfiguration();

			const promises: Thenable<void>[] = [];

			if (excludes != null) {
				if (excludes.globalValue != null) {
					promises.push(
						configuration.updateAny<CoreConfiguration, FilesExcludeConfiguration>(
							'files.exclude',
							excludes.globalValue,
							ConfigurationTarget.Global,
						),
					);
				}
				if (excludes.workspaceValue != null) {
					promises.push(
						configuration.updateAny<CoreConfiguration, FilesExcludeConfiguration>(
							'files.exclude',
							excludes.workspaceValue,
							ConfigurationTarget.Workspace,
						),
					);
				}
			}

			// Remove the currently saved config, since we just restored it
			await this.clearExcludeConfiguration();

			if (!promises.length) return;

			await Promise.allSettled(promises);
		} catch (ex) {
			Logger.error(ex);
			await this.clearExcludeConfiguration();
		} finally {
			Logger.log('FilesExcludeController.restoreConfiguration()', 'done');

			this._working = false;
			this._onDidToggle.fire();
		}
	}

	async toggleConfiguration() {
		if (this._working) return;

		Logger.log('FilesExcludeController.toggleConfiguration()');

		if (this.hasSavedExcludeConfiguration()) {
			await this.restoreConfiguration();
		} else {
			await this.applyConfiguration();
		}
	}

	get canToggle() {
		const exclude = this.getExcludeConfiguration();
		return exclude != null && (exclude.globalValue != null || exclude.workspaceValue != null);
	}

	get toggled() {
		return this.hasSavedExcludeConfiguration();
	}

	private async clearExcludeConfiguration() {
		await this.saveAppliedExcludeConfiguration(undefined);
		await this.saveExcludeConfiguration(undefined);
	}

	private getAppliedExcludeConfiguration(): StoredFilesExcludes | undefined {
		return this.storage.getWorkspace('appliedState');
	}

	private getExcludeConfiguration(): StoredFilesExcludes | undefined {
		return configuration.inspectAny<CoreConfiguration, Record<string, boolean>>('files.exclude');
	}

	private getSavedExcludeConfiguration(): StoredFilesExcludes | undefined {
		const excludes = this.storage.getWorkspace('savedState');
		this.updateContext(excludes);
		return excludes;
	}

	private hasSavedExcludeConfiguration(): boolean {
		return this.getSavedExcludeConfiguration() != null;
	}

	private saveAppliedExcludeConfiguration(excludes: StoredFilesExcludes | undefined): Promise<void> {
		return this.storage.storeWorkspace('appliedState', excludes);
	}

	private saveExcludeConfiguration(excludes: StoredFilesExcludes | undefined): Promise<void> {
		this.updateContext(excludes);
		return this.storage.storeWorkspace('savedState', excludes);
	}

	private _loaded = false;
	private updateContext(excludes: StoredFilesExcludes | undefined) {
		void setContext('toggleexcludedfiles:toggled', excludes != null);
		if (!this._loaded) {
			this._loaded = true;
			void setContext('toggleexcludedfiles:loaded', true);
		}
	}
}
