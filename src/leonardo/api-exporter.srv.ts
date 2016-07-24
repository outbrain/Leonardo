apiExporter.$inject = ['leoConfiguration'];

Leonardo = {
  ready: function(fn: Function) {
    if (Leonardo.addStates) {
      fn.call(this);
    } else {
      const intervalHandle = setInterval(() => {
        if (Leonardo.addStates) {
          fn.call(this);
          clearInterval(intervalHandle);
        }
      }, 10);
    }
  }
};
export function apiExporter(leoConfiguration) {
  Leonardo = Object.assign(Leonardo, leoConfiguration);
}