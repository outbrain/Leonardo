

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
