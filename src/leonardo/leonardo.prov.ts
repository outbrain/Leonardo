import IServiceProvider = angular.IServiceProvider;

export class LeonardoProvider implements IServiceProvider {
    prefix = '';

    setAppPrefix (prefix = '') {
      this.prefix = prefix;
    };

    $get:any[] = [function leonardoProvider() {
        return {
          getAppPrefix: () => {
            return this.prefix;
          }
        };
    }];
}
