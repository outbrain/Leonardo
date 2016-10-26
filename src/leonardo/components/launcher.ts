import uiEvents from './ui-events';

export default function launcher($) {
  return function() {
    function toggleWindow() {
      leonardoApp.trigger(uiEvents.TOGGLE_WINDOW);
      const leonardoWindow = $('.leonardo-window');
      if (leonardoWindow.is(":visible")) {
        leonardoWindow.remove();
      } else {
        $(`<div class="leonardo-window"></div>`).appendTo(leonardoApp).leonardoWindow();
      }
      console.log('toggle window');
    }

    const leonardoApp = $(`<div leonardo-app></div>`);
    leonardoApp.append(`<div style="bottom: 10px; right: 10px" class="leonardo-activator"></div>`)
      .click(toggleWindow);

    $(document).on('keypress', (e) => {
      if (e.shiftKey && e.ctrlKey) {
        switch (e.keyCode) {
          case 12:
            $('.leonardo-activator').toggle();
            break;
          case 11:
            toggleWindow();
            break;
          default:
            break;
        }
      }
    });

    this.append(leonardoApp);
    return this;
  }
}
