'use strict';
import { OutputLevel } from './logger';

export interface IStatusBarConfig {
    enabled: boolean;
}

export interface IConfig {
    debug: boolean;
    outputLevel: OutputLevel;
    statusBar: IStatusBarConfig;
}