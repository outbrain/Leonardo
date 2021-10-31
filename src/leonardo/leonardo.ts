import {leoConfiguration} from './configuration.srv';
import {Storage} from './storage.srv';
import {polifylls} from './polyfills';
import './leonardo.less';
import {XhrMock} from './xhr-mock.srv';

declare const window;
declare const Object;

polifylls();

//Init Configuration
window.Leonardo = window.Leonardo || {};
const configuration = leoConfiguration();
const storage = new Storage();
Object.assign(window.Leonardo || {}, configuration, {storage});
Leonardo.loadSavedStates();

// Init XhrMock
new XhrMock();

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

  storage.setLauncherVisibility(launcher.style.display)
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
  launcher.setAttribute('draggable', true);
  let root = document.documentElement;
  let offsetX, offsetY

  launcher.style.display = storage.getLauncherVisibility()

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

  launcher.addEventListener("dragstart", (e) => {
    offsetX = e.offsetX
    offsetY = e.offsetY
  });

  launcher.addEventListener('drag', (e) => {
    e.preventDefault()
    e.dataTransfer.clearData();
    root.style.setProperty('--leonardo-x', e.clientX - offsetX + "px");
    root.style.setProperty('--leonardo-y', e.clientY - offsetY + "px");
  });

  launcher.addEventListener('dragend', (e) => {
    e.preventDefault()
    root.style.setProperty('--leonardo-x', e.clientX - offsetX + "px");
    root.style.setProperty('--leonardo-y', e.clientY - offsetY + "px");
  });

  launcher.addEventListener("dragover", function(event) {
    event.preventDefault();
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
