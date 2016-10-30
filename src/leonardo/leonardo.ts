/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="leonardo.d.ts" />

import {leoConfiguration} from './configuration.srv';
import {Storage} from './storage.srv';
import {polifylls} from './polyfills';
import {Sinon} from './sinon.srv';
import UIRoot from './ui/ui-root';

declare var window;
declare var Object;

polifylls();

//Init Configuration
window.Leonardo = window.Leonardo || {};
const configuration = leoConfiguration();
const storage = new Storage();
Object.assign(window.Leonardo || {}, configuration, { storage });
Leonardo.loadSavedStates();

// Init Sinon
const sinonService = new Sinon();

//Init UI
const uiRoot = new UIRoot();
