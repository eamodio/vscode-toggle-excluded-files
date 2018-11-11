'use strict';

export enum LogLevel {
    Silent = 'silent',
    Errors = 'errors',
    Verbose = 'verbose',
    Debug = 'debug'
}

export interface StatusBarConfig {
    enabled: boolean;
}

export interface Config {
    debug: boolean;
    outputLevel: LogLevel;
    statusBar: StatusBarConfig;
}
