import launcher from './launcher';
import leonardoWindow from './window';

export default function registerPlugins($) {
  $.fn.leonardoLauncher = launcher($);
  $.fn.leonardoWindow = leonardoWindow($);
};