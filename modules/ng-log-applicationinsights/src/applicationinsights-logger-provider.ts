/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, InjectionToken, Optional, PLATFORM_ID } from '@angular/core';

import {
    EventInfo,
    EventTimingInfo,
    LogInfo,
    LogLevel,
    Logger,
    LoggerProvider,
    PageViewInfo,
    PageViewTimingInfo
} from '@dagonmetric/ng-log';
import { ApplicationInsights, IConfig, IConfiguration } from '@microsoft/applicationinsights-web';

import { ApplicationInsightsLogger } from './applicationinsights-logger';

export interface ApplicationInsightsLoggerOptions {
    config: IConfiguration & IConfig;
}

export const APPLICATIONINSIGHTS_LOGGER_OPTIONS = new InjectionToken<ApplicationInsightsLoggerOptions>(
    'ApplicationInsightsLoggerOptions'
);

/**
 * Logger provider implementation for `ApplicationInsightsLogger`.
 */
@Injectable({
    providedIn: 'any'
})
export class ApplicationInsightsLoggerProvider extends Logger implements LoggerProvider {
    private readonly isBrowser: boolean;
    private readonly appInsightsInternal?: ApplicationInsights;
    private initialized = false;

    private config?: IConfiguration & IConfig;
    private currentLoggerInternal?: ApplicationInsightsLogger;

    get name(): string {
        return 'applicationinsights';
    }

    get currentLogger(): ApplicationInsightsLogger {
        if (this.currentLoggerInternal) {
            return this.currentLoggerInternal;
        }

        this.currentLoggerInternal = new ApplicationInsightsLogger('', this.appInsightsInternal);

        return this.currentLoggerInternal;
    }

    get appInsights(): ApplicationInsights | undefined {
        return this.appInsightsInternal;
    }

    constructor(
        // eslint-disable-next-line @typescript-eslint/ban-types
        @Inject(PLATFORM_ID) platformId: Object,
        @Optional() @Inject(APPLICATIONINSIGHTS_LOGGER_OPTIONS) options?: ApplicationInsightsLoggerOptions
    ) {
        super();
        this.isBrowser = isPlatformBrowser(platformId);
        this.config =
            options && options.config
                ? options.config
                : {
                      instrumentationKey: ''
                  };

        if (this.isBrowser) {
            this.appInsightsInternal = new ApplicationInsights({
                config: this.config
            });

            if (this.config.instrumentationKey) {
                this.appInsightsInternal.loadAppInsights();
                this.config = this.appInsightsInternal.config;
                this.initialized = true;
            }
        }
    }

    setConfig(config: IConfiguration & IConfig): void {
        if (this.appInsightsInternal) {
            this.appInsightsInternal.config = { ...this.appInsightsInternal.config, ...this.config, ...config };
            this.config = this.appInsightsInternal.config;

            if (!this.initialized && this.isBrowser) {
                this.appInsightsInternal.loadAppInsights();
                this.config = this.appInsightsInternal.config;
                this.initialized = true;
            }
        } else {
            this.config = { ...this.config, ...config };
        }
    }

    createLogger(category: string): Logger {
        return new ApplicationInsightsLogger(category, this.appInsightsInternal);
    }

    setUserProperties(userId: string, accountId?: string): void {
        if (this.isBrowser && this.initialized && this.appInsightsInternal) {
            this.appInsightsInternal.setAuthenticatedUserContext(userId, accountId);
        }
    }

    clearUserProperties(): void {
        if (this.isBrowser && this.initialized && this.appInsightsInternal) {
            this.appInsightsInternal.clearAuthenticatedUserContext();
        }
    }

    log(logLevel: LogLevel, message: string | Error, logInfo?: LogInfo): void {
        this.currentLogger.log(logLevel, message, logInfo);
    }

    startTrackPage(name?: string): void {
        this.currentLogger.startTrackPage(name);
    }

    stopTrackPage(name?: string, pageViewInfo?: PageViewTimingInfo): void {
        this.currentLogger.stopTrackPage(name, pageViewInfo);
    }

    trackPageView(pageViewInfo?: PageViewInfo): void {
        this.currentLogger.trackPageView(pageViewInfo);
    }

    startTrackEvent(name: string): void {
        this.currentLogger.startTrackEvent(name);
    }

    stopTrackEvent(name: string, eventInfo?: EventTimingInfo): void {
        this.currentLogger.stopTrackEvent(name, eventInfo);
    }

    trackEvent(eventInfo: EventInfo): void {
        this.currentLogger.trackEvent(eventInfo);
    }

    flush(): void {
        this.currentLogger.flush();
    }
}
