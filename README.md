# Angular Application Insights Logger Integration for NG-LOG

[![Build Status](https://dev.azure.com/DagonMetric/ng-log-applicationinsights/_apis/build/status/DagonMetric.ng-log-applicationinsights?branchName=master)](https://dev.azure.com/DagonMetric/ng-log-applicationinsights/_build/latest?definitionId=11&branchName=master)
[![codecov](https://codecov.io/gh/DagonMetric/ng-log-applicationinsights/branch/master/graph/badge.svg)](https://codecov.io/gh/DagonMetric/ng-log-applicationinsights)
[![npm version](https://img.shields.io/npm/v/@dagonmetric/ng-log-applicationinsights.svg)](https://www.npmjs.com/package/@dagonmetric/ng-log-applicationinsights)
[![Gitter](https://badges.gitter.im/DagonMetric/general.svg)](https://gitter.im/DagonMetric/general?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Microsoft Azure [Application Insights](https://github.com/microsoft/ApplicationInsights-JS) integration/plugin for [@dagonmetric/ng-log](https://github.com/DagonMetric/ng-log) - logging, analytics and telemetry client for Angular.

## Getting Started

### Prerequisites

The following npm packages are required before using this module.

* @angular/common >= v8.0.0-beta.0
* @angular/core >= v8.0.0-beta.0
* @dagonmetric/ng-log >= v2.1.0
* @microsoft/applicationinsights-web >= v2.0.1

### Installation

npm

```bash
npm install @dagonmetric/ng-log-applicationinsights
```

or yarn

```bash
yarn add @dagonmetric/ng-log-applicationinsights
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
  constructor(private readonly _logService: LogService) { }

  ngOnInit(): void {
    // Track traces
    this._logService.trace('Testing trace');
    this._logService.debug('Testing debug');
    this._logService.info('Testing info');
    this._logService.warn('Testing warn');

    // Track exceptions
    this._logService.error(new Error('Testing error'));
    this._logService.fatal(new Error('Testing critical'));

    // Track page view
    this._logService.trackPageView({
      name: 'My Angular App',
      uri: '/home'
    });

    // Track page view with timing
    this._logService.startTrackPage('about');
    this._logService.stopTrackPage('about', { uri: '/about' });

    // Track custom event
    this._logService.trackEvent({
      name: 'video_auto_play_start',
      event_label: 'My promotional video',
      event_category: 'video_auto_play',
      properties: {
        non_interaction: true
      }
    });

    // Track custom event with metrics
    this._logService.trackEvent({
      name: 'foo',
      measurements: {
        non_interaction: 1
      },
      properties: {
        age: 12
      }
    });

    // Track custom event with timing
    this._logService.startTrackEvent('video_auto_play');
    this._logService.stopTrackEvent('video_auto_play', {
      event_label: 'My promotional video',
      event_category: 'video_auto_play',
      properties: {
        non_interaction: true
      }
    });

    // Set user properties
    this._logService.setUserProperties('<Authenticated User Id>', '<Account Id>');

    // Clear user properties
    this._logService.clearUserProperties();
  }
}
```

## Feedback and Contributing

Check out the [Contributing](https://github.com/DagonMetric/ng-log-applicationinsights/blob/master/CONTRIBUTING.md) page to see the best places to log issues and start discussions.

## License

This repository is licensed with the [MIT](https://github.com/DagonMetric/ng-log-applicationinsights/blob/master/LICENSE) license.
