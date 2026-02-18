import { Injectable, inject, runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { RemoteConfig, fetchAndActivate, getValue } from '@angular/fire/remote-config';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {

  private initialized = false;
  private injector = inject(EnvironmentInjector);

  constructor(private remoteConfig: RemoteConfig) {
    if (!environment.production) {
      this.remoteConfig.settings.minimumFetchIntervalMillis = 0;
    }
  }

  private async init() {
    if (!this.initialized) {
      await runInInjectionContext(this.injector, async () => {
        await fetchAndActivate(this.remoteConfig);
      });
      this.initialized = true;
    }
  }

  async isFeatureEnabled(flag: string): Promise<boolean> {
    await this.init();

    return runInInjectionContext(this.injector, () => {
      return getValue(this.remoteConfig, flag).asBoolean();
    });
  }
}
