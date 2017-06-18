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
const f: any = document.createElement('iframe');
f.width = '100%';
f.height = '100%';

f.sandbox = 'allow-scripts allow-same-origin';

let timeout;

function checkIframeLoaded() {
  let iframeDoc = f.contentDocument || f.contentWindow ?  f.contentWindow.document : {};
  if (  iframeDoc.readyState  == 'complete' ) {
    f.contentWindow.eval(`(${window.__leonardo_UI_src})()`);
    clearTimeout(timeout);
    Object.assign(f.style, {
      position: 'fixed',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      border: 'none',
      zIndex: 1000000000000000000000000000000000,
    })
  }
  timeout = window.setTimeout(checkIframeLoaded, 100);
}
checkIframeLoaded();
document.body.appendChild(f);

