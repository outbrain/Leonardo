export default class StringHelper {

  static trim(text) {
    return text.replace(new RegExp(`^[\\s]+|[\\s]+$`, 'g'), '');
  }
}