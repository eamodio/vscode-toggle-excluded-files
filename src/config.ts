'use strict';
import { TraceLevel } from './logger';

export interface StatusBarConfig {
    enabled: boolean;
}

export interface Config {
    debug: boolean;
    outputLevel: TraceLevel;
    statusBar: StatusBarConfig;
}
