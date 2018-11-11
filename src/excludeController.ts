'use strict';
import { Disposable, Event, EventEmitter, workspace } from 'vscode';
import { WorkspaceState } from './constants';
import { Container } from './container';
import { Logger } from './logger';
import { Objects } from './system';

interface IConfigInspect {
    key: string | undefined;
    defaultValue?: { [id: string]: any };
    globalValue?: { [id: string]: any };
    workspaceValue?: { [id: string]: any };
}

abstract class ExcludeControllerBase implements Disposable {
    private _onDidToggle = new EventEmitter<void>();
    get onDidToggle(): Event<void> {
        return this._onDidToggle.event;
    }

    private _disposable: Disposable;
    private _working: boolean = false;

    constructor() {
        this._onConfigurationChanged();

        const subscriptions: Disposable[] = [];

        subscriptions.push(workspace.onDidChangeConfiguration(this._onConfigurationChanged, this));

        this._disposable = Disposable.from(...subscriptions);
    }

    async dispose() {
        this._disposable && this._disposable.dispose();
    }

    protected abstract get section(): string;
    protected abstract get appliedState(): WorkspaceState;
    protected abstract get savedState(): WorkspaceState;

    private _onConfigurationChanged() {
        if (this._working) return;

        const savedExclude = this.getSavedExcludeConfiguration();
        if (savedExclude === undefined) return;

        Logger.log('_onConfigurationChanged');

        const newExclude = this.getExcludeConfiguration();
        if (
            newExclude !== undefined &&
            Objects.areEquivalent(savedExclude.globalValue, newExclude.globalValue) &&
            Objects.areEquivalent(savedExclude.workspaceValue, newExclude.workspaceValue)
        ) {
            return;
        }

        const appliedExclude = this.getAppliedExcludeConfiguration();
        if (
            newExclude !== undefined &&
            appliedExclude !== undefined &&
            Objects.areEquivalent(appliedExclude.globalValue, newExclude.globalValue) &&
            Objects.areEquivalent(appliedExclude.workspaceValue, newExclude.workspaceValue)
        ) {
            return;
        }

        Logger.log('onConfigurationChanged', 'clearing state');

        // Remove the currently saved config, since it was directly edited
        this.clearExcludeConfiguration();
    }

    async applyConfiguration() {
        // If we have saved state, the we are already applied to exit
        if (this._working || this.hasSavedExcludeConfiguration()) return;

        Logger.log(`applyConfiguration('${this.section}')`);

        try {
            this._working = true;

            const exclude = this.getExcludeConfiguration();
            this.saveExcludeConfiguration(exclude);

            const appliedExclude: IConfigInspect = {
                key: exclude === undefined ? undefined : exclude.key,
                globalValue: exclude === undefined || exclude.globalValue === undefined ? undefined : {},
                workspaceValue: exclude === undefined || exclude.workspaceValue === undefined ? undefined : {}
            };

            const promises: Thenable<void>[] = [];

            const cfg = workspace.getConfiguration();
            if (exclude !== undefined && exclude.globalValue !== undefined) {
                const apply = Object.create(null);
                for (const [key] of Objects.entries(exclude.globalValue)) {
                    (appliedExclude.globalValue as any)[key] = apply[key] = false;
                }

                promises.push(cfg.update(this.section, apply, true));
            }

            if (exclude !== undefined && exclude.workspaceValue !== undefined) {
                const apply = Object.create(null);
                for (const [key] of Objects.entries(exclude.workspaceValue)) {
                    (appliedExclude.workspaceValue as any)[key] = apply[key] = false;
                }

                promises.push(cfg.update(this.section, apply, false));
            }

            this.saveAppliedExcludeConfiguration(appliedExclude);

            if (!promises.length) return;

            await Promise.all(promises);
        }
        catch (ex) {
            Logger.error(ex);
            this.clearExcludeConfiguration();
        }
        finally {
            Logger.log(`applyConfiguration('${this.section}')`, 'done');

            this._working = false;
            this._onDidToggle.fire();
        }
    }

    async restoreConfiguration() {
        // If we don't have saved state, the we don't have anything to restore so exit
        if (this._working || !this.hasSavedExcludeConfiguration()) return;

        Logger.log(`restoreConfiguration('${this.section}')`);

        try {
            this._working = true;
            const savedExclude = this.getSavedExcludeConfiguration();

            const promises: Thenable<void>[] = [];

            if (savedExclude !== undefined) {
                if (savedExclude.globalValue !== undefined) {
                    promises.push(workspace.getConfiguration().update(this.section, savedExclude.globalValue, true));
                }
                if (savedExclude.workspaceValue !== undefined) {
                    promises.push(
                        workspace.getConfiguration().update(this.section, savedExclude.workspaceValue, false)
                    );
                }
            }

            // Remove the currently saved config, since we just restored it
            this.clearExcludeConfiguration();

            if (!promises.length) return;

            await Promise.all(promises);
        }
        catch (ex) {
            Logger.error(ex);
            this.clearExcludeConfiguration();
        }
        finally {
            Logger.log(`restoreConfiguration('${this.section}')`, 'done');

            this._working = false;
            this._onDidToggle.fire();
        }
    }

    async toggleConfiguration() {
        if (this._working) return;

        Logger.log(`toggleConfiguration('${this.section}')`);

        return this.hasSavedExcludeConfiguration() ? this.restoreConfiguration() : this.applyConfiguration();
    }

    get canToggle() {
        const exclude = this.getExcludeConfiguration();
        return exclude !== undefined && (exclude.globalValue !== undefined || exclude.workspaceValue !== undefined);
    }

    get toggled() {
        return this.hasSavedExcludeConfiguration();
    }

    private clearExcludeConfiguration() {
        this.saveAppliedExcludeConfiguration(undefined);
        this.saveExcludeConfiguration(undefined);
    }

    private getExcludeConfiguration(): IConfigInspect | undefined {
        return workspace.getConfiguration().inspect(this.section);
    }

    private getAppliedExcludeConfiguration(): IConfigInspect | undefined {
        return Container.context.workspaceState.get<IConfigInspect>(this.appliedState);
    }

    private getSavedExcludeConfiguration(): IConfigInspect | undefined {
        return Container.context.workspaceState.get<IConfigInspect>(this.savedState);
    }

    private hasSavedExcludeConfiguration(): boolean {
        return this.getSavedExcludeConfiguration() !== undefined;
    }

    private saveAppliedExcludeConfiguration(excluded: IConfigInspect | undefined): void {
        Container.context.workspaceState.update(this.appliedState, excluded);
    }

    private saveExcludeConfiguration(excluded: IConfigInspect | undefined): void {
        Container.context.workspaceState.update(this.savedState, excluded);
    }
}

export class FilesExcludeController extends ExcludeControllerBase {
    protected get section(): string {
        return 'files.exclude';
    }

    protected get appliedState(): WorkspaceState {
        return WorkspaceState.AppliedState;
    }

    protected get savedState(): WorkspaceState {
        return WorkspaceState.SavedState;
    }
}
