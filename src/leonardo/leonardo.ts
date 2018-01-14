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

const launcher: any = document.createElement('div');
let f: any;
launcher.classList.add('leonardo-launcher');

function toggleView() {
  if (f.style.display === 'none') {
    f.style.display = 'block';
    f.contentDocument.getElementById('app').dispatchEvent(new Event('ui-show'));
    document.body.classList.add('leonardo-launcher-active');
  } else {
    f.style.display = 'none';
    document.body.classList.remove('leonardo-launcher-active');
  }
}

function toggleLauncher() {
  if (launcher.style.display === 'none') {
    launcher.style.display = 'block';
  } else {
    launcher.style.display = 'none';
  }
}

document.addEventListener('keyup', (e) => {
  if (e.ctrlKey && e.shiftKey && e.keyCode === 76) {
    return toggleLauncher();
  }
  if (f && e.ctrlKey && e.shiftKey && e.keyCode === 86) {
    return toggleView();
  }
  if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
    return Leonardo.toggleConsoleOutput(Leonardo.get);
  }
  if (f && e.keyCode === 27 && f.style.display === 'block') {
    return toggleView();
  }

});
launcher.addEventListener('click', (e) => {
  f && toggleView();
  e.stopPropagation();
});

window.document.body.appendChild(launcher);
let timeout;
function checkIframeLoaded() {
  let iframeDoc = f.contentDocument || f.contentWindow ?  f.contentWindow.document : {};
  if (iframeDoc.readyState  == 'complete' && document.readyState  == 'complete' ) {
    clearTimeout(timeout);
    iframeDoc.write('<html><body></body></html>');
    iframeDoc.body.innerHTML = '<div id="app"></div>';
    iframeDoc.head.innerHTML = '<base href="." target="_blank">';

    f.contentWindow.eval(`(${window.__leonardo_UI_src})()`);

    return;
  }
  timeout = window.setTimeout(checkIframeLoaded, 100);

}

//Init UI
if (!window.Leonardo.storage.getNoUI()) {
  f = document.createElement('iframe');
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

  document.body.appendChild(f);
  checkIframeLoaded();
}
