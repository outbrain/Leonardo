import IServiceProvider = angular.IServiceProvider;

export class LeonardoProvider implements IServiceProvider {
    prefix:string = '';

    setAppPrefix (prefix:string) {
        this.prefix = prefix;
    };

    $get:any[] = [function leonardoProvider() {
        return {
            getAppPrefix: function () {
                return this.prefix;
            }
        };
    }];
}
