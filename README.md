# Angular Application Insights Integration for NG-LOG

[![GitHub Actions Status](https://github.com/DagonMetric/ng-log-applicationinsights/workflows/Main%20Workflow/badge.svg)](https://github.com/DagonMetric/ng-log-applicationinsights/actions)
[![codecov](https://codecov.io/gh/DagonMetric/ng-log-applicationinsights/branch/master/graph/badge.svg)](https://codecov.io/gh/DagonMetric/ng-log-applicationinsights)
[![npm version](https://img.shields.io/npm/v/@dagonmetric/ng-log-applicationinsights.svg)](https://www.npmjs.com/package/@dagonmetric/ng-log-applicationinsights)
[![Gitter](https://badges.gitter.im/DagonMetric/general.svg)](https://gitter.im/DagonMetric/general?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Microsoft Azure Application Insights integration of [DagonMetric/ng-log](https://github.com/DagonMetric/ng-log) for Angular applications.

## Getting Started

### Installation

npm

```bash
npm install @dagonmetric/ng-log @dagonmetric/ng-log-applicationinsights
```

or yarn

```bash
yarn add @dagonmetric/ng-log @dagonmetric/ng-log-applicationinsights
```

### Module Setup (app.module.ts)

```typescript
import { LogModule } from '@dagonmetric/ng-log';
import { ApplicationInsightsLoggerModule } from '@dagonmetric/ng-log-applicationinsights';

@NgModule({
  imports: [
    // Other module imports

    // ng-log modules
    LogModule,
    ApplicationInsightsLoggerModule.withOptions({
      config: {
        instrumentationKey: 'YOUR_INSTRUMENTATION_KEY_GOES_HERE'
        /* ...Other Configuration Options... */
      }
    })
  ]
})
export class AppModule { }
```

### Usage (app.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';

import { LogService } from '@dagonmetric/ng-log';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private readonly logService: LogService) { }

  ngOnInit(): void {
    // Track traces
    this.logService.trace('Testing trace');
    this.logService.debug('Testing debug');
    this.logService.info('Testing info');
    this.logService.warn('Testing warn');

    // Track exceptions
    this.logService.error(new Error('Testing error'));
    this.logService.fatal(new Error('Testing critical'));

    // Track page view
    this.logService.trackPageView({
      name: 'My Angular App',
      uri: '/home'
    });

    // Track page view with timing
    this.logService.startTrackPage('about');
    this.logService.stopTrackPage('about', { uri: '/about' });

    // Track custom event
    this.logService.trackEvent({
      name: 'video_auto_play_start',
      properties: {
        non_interaction: true
      }
    });

    // Track custom event with metrics
    this.logService.trackEvent({
      name: 'foo',
      measurements: {
        non_interaction: 1
      },
      properties: {
        age: 12
      }
    });

    // Track custom event with timing
    this.logService.startTrackEvent('video_auto_play');
    this.logService.stopTrackEvent('video_auto_play', {
      properties: {
        non_interaction: true
      }
    });

    // Set user properties
    this.logService.setUserProperties('<Authenticated User Id>', '<Account Id>');

    // Clear user properties
    this.logService.clearUserProperties();
  }
}
```

## Related Projects

* [ng-log](https://github.com/DagonMetric/ng-log) - Angular logging and telemetry service abstractions and some implementations
* [ng-log-gtag](https://github.com/DagonMetric/ng-log-gtag) - Angular Google Analytics (gtag.js) logger implementation for `ng-log`
* [ng-log-firebase-analytics](https://github.com/DagonMetric/ng-log-firebase-analytics) - Firebase Analytics implementation for `ng-log`
* [ng-log-facebook-analytics](https://github.com/DagonMetric/ng-log-facebook-analytics) - Facebook Pixel Analytics implementation for `ng-log`

## Feedback and Contributing

Check out the [Contributing](https://github.com/DagonMetric/ng-log-applicationinsights/blob/master/CONTRIBUTING.md) page.

## License

This repository is licensed with the [MIT](https://github.com/DagonMetric/ng-log-applicationinsights/blob/master/LICENSE) license.
