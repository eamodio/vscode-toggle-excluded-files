'use strict';

export type Commands = 'toggleexcludedfiles.show' | 'toggleexcludedfiles.hide' | 'toggleexcludedfiles.toggle';
export const Commands = {
    Show: 'toggleexcludedfiles.show' as Commands,
    Hide: 'toggleexcludedfiles.hide' as Commands,
    Toggle: 'toggleexcludedfiles.toggle' as Commands
};