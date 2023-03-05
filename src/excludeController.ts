import type { ConfigurationChangeEvent, Disposable, Event } from 'vscode';
import { ConfigurationTarget, EventEmitter } from 'vscode';
import { ContextKeys, WorkspaceState } from './constants';
import type { Container } from './container';
import { setContext } from './context';
import { configuration } from './system/configuration';
import { Logger } from './system/logger';
import { areEqual } from './system/object';

type ConfigInspect<T> = ReturnType<typeof configuration.inspectAny<T>>;
type FilesExcludeInspect = ConfigInspect<Record<string, boolean>>;

export class FilesExcludeController implements Disposable {
	private _onDidToggle = new EventEmitter<void>();
	get onDidToggle(): Event<void> {
		return this._onDidToggle.event;
	}

	private _disposable: Disposable;
	private readonly _section = 'files.exclude' as const;
	private _working: boolean = false;

	constructor(private readonly container: Container) {
		this._disposable = configuration.onDidChangeAny(this.onConfigurationChanged, this);
		this.onConfigurationChanged();
	}

	dispose() {
		this._disposable?.dispose();
	}

	private get appliedState(): WorkspaceState {
		return WorkspaceState.AppliedState;
	}

	private get savedState(): WorkspaceState {
		return WorkspaceState.SavedState;
	}

	private onConfigurationChanged(e?: ConfigurationChangeEvent) {
		if (this._working) return;
		if (e != null && !e.affectsConfiguration(this._section)) return;

		const savedExclude = this.getSavedExcludeConfiguration();
		if (savedExclude == null) return;

		Logger.log('ExcludeController.onConfigurationChanged');

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

		Logger.log('ExcludeController.onConfigurationChanged', 'clearing state');

		// Remove the currently saved config, since it was directly edited
		void this.clearExcludeConfiguration();
	}

	async applyConfiguration() {
		// If we have saved state, the we are already applied to exit
		if (this._working || this.hasSavedExcludeConfiguration()) return;

		Logger.log(`ExcludeController.applyConfiguration('${this._section}')`);

		try {
			this._working = true;

			const exclude = this.getExcludeConfiguration()!;
			await this.saveExcludeConfiguration(exclude);

			const appliedExclude: FilesExcludeInspect = {
				key: exclude.key,
				globalValue: exclude.globalValue == null ? undefined : {},
				workspaceValue: exclude.workspaceValue == null ? undefined : {},
				// workspaceFolderValue: exclude.workspaceFolderValue == null ? undefined : {},
			};

			const promises: Thenable<void>[] = [];

			if (exclude.globalValue != null && appliedExclude.globalValue != null) {
				const apply = Object.create(null);
				for (const key of Object.keys(exclude.globalValue)) {
					appliedExclude.globalValue[key] = apply[key] = false;
				}

				promises.push(configuration.updateAny(this._section, apply, ConfigurationTarget.Global));
			}

			if (exclude.workspaceValue != null && appliedExclude.workspaceValue != null) {
				const apply = Object.create(null);
				for (const key of Object.keys(exclude.workspaceValue)) {
					appliedExclude.workspaceValue[key] = apply[key] = false;
				}

				promises.push(configuration.updateAny(this._section, apply, ConfigurationTarget.Workspace));
			}

			// if (exclude.workspaceFolderValue != null && appliedExclude.workspaceFolderValue != null) {
			// 	const apply = Object.create(null);
			// 	for (const key of Object.keys(exclude.workspaceFolderValue)) {
			// 		appliedExclude.workspaceFolderValue[key] = apply[key] = false;
			// 	}

			// 	promises.push(configuration.updateAny(this._section, apply, ConfigurationTarget.WorkspaceFolder));
			// }

			await this.saveAppliedExcludeConfiguration(appliedExclude);

			if (!promises.length) return;

			void (await Promise.allSettled(promises));
		} catch (ex) {
			Logger.error(ex);
			await this.clearExcludeConfiguration();
		} finally {
			Logger.log(`applyConfiguration('${this._section}')`, 'done');

			this._working = false;
			this._onDidToggle.fire();
		}
	}

	async restoreConfiguration() {
		// If we don't have saved state, the we don't have anything to restore so exit
		if (this._working || !this.hasSavedExcludeConfiguration()) return;

		Logger.log(`ExcludeController.restoreConfiguration('${this._section}')`);

		try {
			this._working = true;
			const savedExclude = this.getSavedExcludeConfiguration();

			const promises: Thenable<void>[] = [];

			if (savedExclude != null) {
				if (savedExclude.globalValue != null) {
					promises.push(
						configuration.updateAny(this._section, savedExclude.globalValue, ConfigurationTarget.Global),
					);
				}
				if (savedExclude.workspaceValue != null) {
					promises.push(
						configuration.updateAny(
							this._section,
							savedExclude.workspaceValue,
							ConfigurationTarget.Workspace,
						),
					);
				}
			}

			// Remove the currently saved config, since we just restored it
			await this.clearExcludeConfiguration();

			if (!promises.length) return;

			await Promise.all(promises);
		} catch (ex) {
			Logger.error(ex);
			await this.clearExcludeConfiguration();
		} finally {
			Logger.log(`ExcludeController.restoreConfiguration('${this._section}')`, 'done');

			this._working = false;
			this._onDidToggle.fire();
		}
	}

	async toggleConfiguration() {
		if (this._working) return;

		Logger.log(`ExcludeController.toggleConfiguration('${this._section}')`);

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

	private getExcludeConfiguration(): FilesExcludeInspect | undefined {
		return configuration.inspectAny<Record<string, boolean>>(this._section);
	}

	private getAppliedExcludeConfiguration(): FilesExcludeInspect | undefined {
		return this.container.context.workspaceState.get<FilesExcludeInspect>(this.appliedState);
	}

	private _loaded = false;
	private getSavedExcludeConfiguration(): FilesExcludeInspect | undefined {
		const state = this.container.context.workspaceState.get<FilesExcludeInspect>(this.savedState);
		void setContext(ContextKeys.Toggled, state != null);
		if (!this._loaded) {
			this._loaded = true;
			void setContext(ContextKeys.Loaded, true);
		}
		return state;
	}

	private hasSavedExcludeConfiguration(): boolean {
		return this.getSavedExcludeConfiguration() != null;
	}

	private async saveAppliedExcludeConfiguration(excluded: FilesExcludeInspect | undefined): Promise<void> {
		await this.container.context.workspaceState.update(this.appliedState, excluded);
	}

	private async saveExcludeConfiguration(excluded: FilesExcludeInspect | undefined): Promise<void> {
		await this.container.context.workspaceState.update(this.savedState, excluded);
	}
}
