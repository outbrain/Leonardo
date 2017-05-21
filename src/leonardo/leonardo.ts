import {leoConfiguration} from './configuration.srv';
import {Storage} from './storage.srv';
import {polifylls} from './polyfills';
import {Sinon} from './sinon.srv';
// import UIRoot from './ui/ui-root';
import './style/app.less';
import '../../node_modules/ace-builds/src/ace.js';

declare const window;
declare const Object;

polifylls();

//Init Configuration
window.Leonardo = window.Leonardo || {};
const configuration = leoConfiguration();
const storage = new Storage();
Object.assign(window.Leonardo || {}, configuration, {storage});
Leonardo.loadSavedStates();

// Init Sinon
new Sinon();
//Init UI
const f = document.createElement('iframe');
// console.log(window.__leonardo_UI_src);
f['san' + 'dbox'] = 'allow-scripts allow-same-origin';
// f['srcdoc'] = uiSrc.slice(13, uiSrc.length-1);
document.body.appendChild(f);

