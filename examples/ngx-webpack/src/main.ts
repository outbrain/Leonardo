import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { registerLeonardo } from './leonardo-mock';

if (environment.production) {
  enableProdMode();
} else {
  // this will import leonardo mock, for a more robust production 
  // configuration  you can use webpack with chungs to add leonardo
  // in dev env
  registerLeonardo()
}


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
