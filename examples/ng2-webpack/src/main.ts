import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import register from './mock'

if (environment.production) {
  enableProdMode();
} else {
  register()
}

platformBrowserDynamic().bootstrapModule(AppModule);
