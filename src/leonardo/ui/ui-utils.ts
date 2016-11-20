/// <reference path="../leonardo.d.ts" />

export default class Utils {
  constructor() {}
  static getElementFromHtml(html: string) : HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = html;
    return <HTMLElement>div.firstChild;
  }

}
