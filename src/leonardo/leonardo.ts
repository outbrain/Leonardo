import {leoConfiguration} from './configuration.srv';
import {Storage} from './storage.srv';
import {polifylls} from './polyfills';
import {Sinon} from './sinon.srv';
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

// Init launcher
const launcher: any = document.createElement('div');
launcher.classList.add('leonardo-launcher');
launcher.addEventListener('click', (e) => {
 if(f.style.display === 'block'){
   f.style.display = 'none';
 }
 else {
   f.style.display = 'block';
 }
 e.stopPropagation();
});


window.document.body.appendChild(launcher);

//Init UI
const f: any = document.createElement('iframe');
f.width = '100%';
f.height = '100%';
f.src = "#";
f.sandbox = 'allow-scripts allow-same-origin allow-modals';

let timeout;

function checkIframeLoaded() {
  let iframeDoc = f.contentDocument || f.contentWindow ?  f.contentWindow.document : {};
  if (  iframeDoc.readyState  == 'complete' ) {
    clearTimeout(timeout);

    iframeDoc.body.innerHTML = '<div id="app"></div>';
    iframeDoc.head.innerHTML = '<base href="." target="_blank">';

    f.contentWindow.eval(`(${window.__leonardo_UI_src})()`);
    Object.assign(f.style, {
      position: 'fixed',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      border: 'none',
      display: 'none',
      overflow: 'visible',
      zIndex: 100000000000000,
    });
    return;
  }
  timeout = window.setTimeout(checkIframeLoaded, 100);

}
checkIframeLoaded();
document.body.appendChild(f);

