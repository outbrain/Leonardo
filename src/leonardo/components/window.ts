export default function leonardoWindow($) {
  return function() {
    this.append(`<div class=".leonardo-top-nav"></div>`)
        .append(`<div class=".leonardo-main-nav"></div>`);
  }
}