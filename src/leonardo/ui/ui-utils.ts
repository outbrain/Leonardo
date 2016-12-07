export default class UiUtils {
  constructor() {
  }

  static getElementFromHtml(html: string): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = html;
    return <HTMLElement>div.firstChild;
  }

  static guidGenerator() {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
  }
}
