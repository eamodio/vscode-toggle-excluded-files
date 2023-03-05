import type { MessageItem } from 'vscode';
import { window } from 'vscode';
import { commandPrefix } from '../../constants';
import { Logger } from '../logger';
import { LogLevel } from '../logger.constants';

export function createCommandDecorator(registry: Command[]): (command: string, options?: CommandOptions) => Function {
	return (command: string, options?: CommandOptions) => _command(registry, command, options);
}

export interface CommandOptions {
	args?(...args: any[]): any[];
	customErrorHandling?: boolean;
	showErrorMessage?: string;
}

export interface Command {
	name: string;
	key: string;
	method: Function;
	options: CommandOptions;
}

function _command(registry: Command[], command: string, options: CommandOptions = {}): Function {
	return (target: any, key: string, descriptor: any) => {
		if (!(typeof descriptor.value === 'function')) throw new Error('not supported');

		let method;
		if (!options.customErrorHandling) {
			method = async function (this: any, ...args: any[]) {
				try {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-return
					return await descriptor.value.apply(this, options.args ? options.args(args) : args);
				} catch (ex) {
					Logger.error(ex);

					if (options.showErrorMessage) {
						if (Logger.enabled(LogLevel.Error)) {
							const actions: MessageItem[] = [{ title: 'Open Output Channel' }];

							const result = await window.showErrorMessage(
								`${options.showErrorMessage} \u00a0\u2014\u00a0 ${ex.toString()}`,
								...actions,
							);
							if (result === actions[0]) {
								Logger.showOutputChannel();
							}
						} else {
							void window.showErrorMessage(
								`${options.showErrorMessage} \u00a0\u2014\u00a0 ${ex.toString()}`,
							);
						}
					}

					return undefined;
				}
			};
		} else {
			method = descriptor.value;
		}

		registry.push({
			name: `${commandPrefix}.${command}`,
			key: key,
			method: method,
			options: options,
		});
	};
}
