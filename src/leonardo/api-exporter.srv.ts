apiExporter.$inject = ['leoConfiguration'];

Leonardo = {
  ready: function(fn: Function) {
    const intervalHandle = setInterval(() => {
      if (Leonardo.addStates) {
        fn.call(this);
        clearInterval(intervalHandle);
      }
    }, 500);
    return this;
  }
};
export function apiExporter(leoConfiguration) {
  Leonardo = Object.assign(Leonardo, leoConfiguration);
}