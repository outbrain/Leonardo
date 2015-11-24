describe('Protractor Demo App', function () {
  it('should get to ALL DONE', function () {
    browser.get('http://localhost:63342/Leonardo/examples/angularIL/').then(function () {
      browser.driver.manage().window().maximize();

      browser.driver.executeAsyncScript(function () {

        var callback = arguments[arguments.length - 1];
        var configuration = angular.element(document.body).injector().get('leoConfiguration');
        var $rootScope = angular.element(document.body).injector().get('$rootScope');
        configuration.activateStateOption("Login", "Login With Delay");
        configuration.activateStateOption("Fetch Character", "success empty");
        configuration.activateStateOption("Create Character", "success");
        $rootScope.$digest();
        setTimeout(callback, 1000);

      }).then(function () {
        element(by.model('login.user')).sendKeys('sagivfrank');
        element(by.model('login.password')).sendKeys('mypass');
        element(by.id('login-button')).click().then(function(){
          return browser.sleep(4000);
        });

        element(by.id('btn-create')).click().then(function(){
          return browser.sleep(2500);
        });

        element(by.id('btn-create')).click().then(function(){
          return browser.sleep(2000);
        });

        element(by.id('btn-create')).click().then(function(){
          return browser.sleep(2000);
        });

        element(by.id('complete-button')).click().then(function(){
          return browser.sleep(2500);
        });


        browser.wait(protractor.ExpectedConditions.textToBePresentInElement($('h1'), 'All DONE'), 1000);
      });
    });
  });
});