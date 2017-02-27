'use strict';
import { Objects } from './system';
import { Disposable, ExtensionContext, workspace } from 'vscode';
import { Logger } from './logger';

interface IConfigInspect {
    key: string;
    defaultValue?: {};
    globalValue?: {};
    workspaceValue?: {};
};

export default class ExcludeController extends Disposable {

    private _disposable: Disposable;
    private _ignoreConfigurationChange: boolean;

    constructor(private context: ExtensionContext) {
        super(() => this.dispose());

        this._ignoreConfigurationChange = true;
        this._onConfigurationChanged();

        const subscriptions: Disposable[] = [];

        subscriptions.push(workspace.onDidChangeConfiguration(this._onConfigurationChanged, this));

        this._disposable = Disposable.from(...subscriptions);
    }

    async dispose() {
        this._disposable && this._disposable.dispose();
    }

    private _onConfigurationChanged() {
        if (!this._ignoreConfigurationChange) {
            const savedExclude = this.getSavedExcludeConfiguration();
            if (savedExclude) {
                const newExclude = this.getExcludeConfiguration();
                if (!Objects.areEquivalent(savedExclude, newExclude)) {
                    // Remove the currently saved config, since it was directly edited
                    this.clearExcludeConfiguration();
                }
            }
        }

        this._ignoreConfigurationChange = false;
    }

    async applyConfiguration() {
        // If we have saved state, the we are already applied to exit
        if (this.hasSavedExcludeConfiguration()) return;

        try {
            const exclude = this.getExcludeConfiguration();
            this.saveExcludeConfiguration(exclude);

            const cfg = workspace.getConfiguration('');
            if (exclude.globalValue) {
                const apply = Object.create(null);
                for (const [key] of Objects.entries(exclude.globalValue)) {
                    apply[key] = false;
                }

                this._ignoreConfigurationChange = true;
                await cfg.update('files.exclude', apply, true);
            }

            if (exclude.workspaceValue) {
                const apply = Object.create(null);
                for (const [key] of Objects.entries(exclude.workspaceValue)) {
                    apply[key] = false;
                }

                this._ignoreConfigurationChange = true;
                await cfg.update('files.exclude', apply, false);
            }
        }
        catch (ex) {
            Logger.error(ex);
            this.clearExcludeConfiguration();
        }
    }

    async restoreConfiguration() {
        // If we don't have saved state, the we don't have anything to restore so exit
        if (!this.hasSavedExcludeConfiguration()) return;

        try {
            const savedExclude = this.getSavedExcludeConfiguration();

            const current = this.getExcludeConfiguration();
            if (current.globalValue !== savedExclude.globalValue) {
                this._ignoreConfigurationChange = true;
                await workspace.getConfiguration('').update('files.exclude', savedExclude.globalValue, true);
            }
            if (current.workspaceValue !== savedExclude.workspaceValue) {
                this._ignoreConfigurationChange = true;
                await workspace.getConfiguration('').update('files.exclude', savedExclude.workspaceValue, false);
            }

            // Remove the currently saved config, since we just restored it
            this.clearExcludeConfiguration();
        }
        catch (ex) {
            Logger.error(ex);
            this.clearExcludeConfiguration();
        }
    }

    async toggleConfiguration() {
        return this.hasSavedExcludeConfiguration()
            ? this.restoreConfiguration()
            : this.applyConfiguration();
    }

    private clearExcludeConfiguration() {
        this.saveExcludeConfiguration(undefined);
    }

    private getExcludeConfiguration(): IConfigInspect {
        return workspace.getConfiguration('').inspect('files.exclude');
    }

    private getSavedExcludeConfiguration(): IConfigInspect {
        return this.context.workspaceState.get<IConfigInspect>('toggleexcludedfiles:state');
    }

    private hasSavedExcludeConfiguration(): boolean {
        return !!this.getSavedExcludeConfiguration();
    }

    private saveExcludeConfiguration(excluded: IConfigInspect | undefined): void {
        this.context.workspaceState.update('toggleexcludedfiles:state', excluded);
    }
}
