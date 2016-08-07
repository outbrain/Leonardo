export default function launcher() {
  const leonardoApp = $(`<div leonardo-app></div>`);
  leonardoApp.append(`<div style="bottom: 10px; right: 10px" class="leonardo-activator"></div>`)
    .click(() => {
      console.log('launch');
    });
  this.append(leonardoApp);
  return this;
}
