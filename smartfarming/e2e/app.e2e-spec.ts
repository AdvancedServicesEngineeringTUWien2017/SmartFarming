import { SmartfarmingPage } from './app.po';

describe('smartfarming App', () => {
  let page: SmartfarmingPage;

  beforeEach(() => {
    page = new SmartfarmingPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
