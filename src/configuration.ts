'use strict';
import { OutputLevel } from './logger';

export interface IStatusBarConfig {
    enabled: boolean;
}

export interface IAdvancedConfig {
    debug: boolean;
    output: {
        level: OutputLevel;
    };
}

export interface IConfig {
    statusBar: IStatusBarConfig;
    advanced: IAdvancedConfig;
}