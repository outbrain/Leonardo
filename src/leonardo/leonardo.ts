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
let keysPressed = {
  ctrl: false,
  shift: false,
  l: false
};

const launcher: any = document.createElement('div');
launcher.classList.add('leonardo-launcher');

function hideLeonardo() {
  keysPressed = {ctrl: false, shift: false, l: false};
  f.style.display = 'none';
}

document.addEventListener('keydown', (e) => {
  switch (e.keyCode) {
      case 16:
        keysPressed.ctrl = true;
        break;
      case 17:
        keysPressed.shift = true;
        break;
      case 76:
        keysPressed.l = true;
        break;
      case 27:
        if (f.style.display === 'block') {
          hideLeonardo();
        }
        break;
  }
  if (f.style.display === 'none' && keysPressed.ctrl && keysPressed.shift && keysPressed.l) {
    f.style.display = 'block';
  }
});
document.addEventListener('keyup', (e) => {
  switch (e.keyCode) {
      case 16:
          keysPressed.ctrl = false;
          break;
      case 17:
          keysPressed.shift = false;
          break;
      case 76:
          keysPressed.l = false;
          break;
  }
});
launcher.addEventListener('click', (e) => {
 if(f.style.display === 'block'){
   hideLeonardo();
 }
 else {
   f.style.display = 'block';
   f.contentDocument.getElementById('app').dispatchEvent(new Event('ui-show'));
 }
 e.stopPropagation();
});


window.document.body.appendChild(launcher);

//Init UI
const f: any = document.createElement('iframe');
f.width = '100%';
f.height = '100%';
//f.src = "";
//f.sandbox = 'allow-scripts allow-same-origin allow-modals';
Object.assign(f.style, {
  position: 'fixed',
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
  border: 'none',
  display: 'none',
  overflow: 'visible',
  zIndex: 2147483646,
});
let timeout;

function checkIframeLoaded() {
  let iframeDoc = f.contentDocument || f.contentWindow ?  f.contentWindow.document : {};
  if (  iframeDoc.readyState  == 'complete' ) {
    clearTimeout(timeout);
    iframeDoc.write('<html><body></body></html>');
    iframeDoc.body.innerHTML = '<div id="app"></div>';
    iframeDoc.head.innerHTML = '<base href="." target="_blank">';

    f.contentWindow.eval(`(${window.__leonardo_UI_src})()`);

    return;
  }
  timeout = window.setTimeout(checkIframeLoaded, 100);

}
checkIframeLoaded();
document.body.appendChild(f);

