import { commands, EventEmitter } from 'vscode';
import type { ContextKeys } from './constants';
import { CoreCommands } from './constants';

const contextStorage = new Map<string, unknown>();

type AllContextKeys = ContextKeys;

const _onDidChangeContext = new EventEmitter<AllContextKeys>();
export const onDidChangeContext = _onDidChangeContext.event;

export function getContext<T>(key: AllContextKeys): T | undefined;
export function getContext<T>(key: AllContextKeys, defaultValue: T): T;
export function getContext<T>(key: AllContextKeys, defaultValue?: T): T | undefined {
	return (contextStorage.get(key) as T | undefined) ?? defaultValue;
}

export async function setContext(key: AllContextKeys, value: unknown): Promise<void> {
	contextStorage.set(key, value);
	void (await commands.executeCommand(CoreCommands.SetContext, key, value));
	_onDidChangeContext.fire(key);
}
