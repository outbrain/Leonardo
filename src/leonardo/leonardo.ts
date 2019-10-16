import {leoConfiguration} from './configuration.srv';
import {Storage} from './storage.srv';
import {polifylls} from './polyfills';
import {Sinon} from './sinon.srv';
import './leonardo.less';

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

let launcher: any;
let f: any;
let timeout;

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

function checkIframeLoaded() {
  let iframeDoc = f.contentDocument || f.contentWindow ?  f.contentWindow.document : {};
  if (iframeDoc.readyState  == 'complete' && document.readyState  == 'complete' ) {
    clearTimeout(timeout);
    iframeDoc.head.innerHTML = '<base href="." target="_blank">';
    iframeDoc.body.innerHTML = '<div id="app"></div>';

    f.contentWindow.eval(`(${window.__leonardo_UI_src})()`);
    return;
  }
  timeout = window.setTimeout(checkIframeLoaded, 100);
}

if (!window.Leonardo.storage.getNoUI()) {

  launcher = document.createElement('div');
  launcher.classList.add('leonardo-launcher');

  document.addEventListener('keyup', (e) => {
    if (e.ctrlKey && e.shiftKey && e.keyCode === 76) {
      return toggleLauncher();
    }
    if (f && e.ctrlKey && e.shiftKey && e.keyCode === 86) {
      return toggleView();
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
      return Leonardo.toggleConsoleOutput();
    }
    if (f && e.keyCode === 27 && f.style.display === 'block') {
      return toggleView();
    }

  });

  launcher.addEventListener('click', (e) => {
    f && toggleView();
    e.stopPropagation();
  });

//Init UI
  f = document.createElement('iframe');
  f.width = '100%';
  f.height = '100%';
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

  document.addEventListener('DOMContentLoaded', () => {
    window.document.body.appendChild(launcher);
    window.document.body.appendChild(f);
  }, false);

  checkIframeLoaded();
}
