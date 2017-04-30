import { Ng2LeonardoPage } from './app.po';

describe('ng2-leonardo App', () => {
  let page: Ng2LeonardoPage;

  beforeEach(() => {
    page = new Ng2LeonardoPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
