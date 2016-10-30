/// <reference path="../leonardo.d.ts" />

export default class Utils {
  constructor() {}
  static getElementFromHtml(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
  }

}
