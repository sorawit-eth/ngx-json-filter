import { browser, element, by } from 'protractor';

export class NgxJsonFilterPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('ngx-root h1')).getText();
  }
}
