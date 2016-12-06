export default class Utils {
  constructor() {
  }

  static isUndefined(value) {return typeof value === 'undefined';}

  static isNumber(value) {return typeof value === 'number';}

  static isFunction(value) {
    return typeof value === 'function';
  }

  static isString(value) {return typeof value === 'string';}

  static fromJson(json) {
    return this.isString(json)
      ? JSON.parse(json)
      : json;
  }

  static toJson(obj, pretty?) {
    if (this.isUndefined(obj)) return undefined;
    if (!this.isNumber(pretty)) {
      pretty = pretty ? 2 : null;
    }
    return JSON.stringify(obj, null, pretty);
  }
}
