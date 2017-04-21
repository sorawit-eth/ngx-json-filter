import { NgxJsonFilterPage } from './app.po';

describe('ngx-json-filter App', () => {
  let page: NgxJsonFilterPage;

  beforeEach(() => {
    page = new NgxJsonFilterPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('ngx works!');
  });
});
