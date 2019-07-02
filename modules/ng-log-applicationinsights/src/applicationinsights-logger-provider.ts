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
    Logger,
    LoggerProvider,
    LogInfo,
    LogLevel,
    PageViewInfo,
    PageViewTimingInfo
} from '@dagonmetric/ng-log';
import { ApplicationInsights, IConfig, IConfiguration } from '@microsoft/applicationinsights-web';

import { ApplicationInsightsLogger } from './applicationinsights-logger';

export interface ApplicationInsightsLoggerOptions {
    config: IConfiguration & IConfig;
}

export const APPLICATIONINSIGHTS_LOGGER_OPTIONS = new InjectionToken<ApplicationInsightsLoggerOptions>('ApplicationInsightsLoggerOptions');

/**
 * Logger provider implementation for `ApplicationInsightsLogger`.
 */
@Injectable({
    providedIn: 'root'
})
export class ApplicationInsightsLoggerProvider extends Logger implements LoggerProvider {
    private readonly _isBrowser: boolean;
    private readonly _appInsights?: ApplicationInsights;
    private _initialized = false;

    private _config?: IConfiguration & IConfig;
    private _currentLogger?: ApplicationInsightsLogger;

    get name(): string {
        return 'applicationinsights';
    }

    get currentLogger(): ApplicationInsightsLogger {
        if (this._currentLogger) {
            return this._currentLogger;
        }

        this._currentLogger = new ApplicationInsightsLogger('', this._appInsights);

        return this._currentLogger;
    }

    get appInsights(): ApplicationInsights | undefined {
        return this._appInsights;
    }

    constructor(
        @Inject(PLATFORM_ID) platformId: Object,
        @Optional() @Inject(APPLICATIONINSIGHTS_LOGGER_OPTIONS) options?: ApplicationInsightsLoggerOptions) {
        super();
        this._isBrowser = isPlatformBrowser(platformId);
        this._config = options && options.config ? options.config : {
            instrumentationKey: ''
        };

        if (this._isBrowser) {
            this._appInsights = new ApplicationInsights({
                config: this._config
            });

            if (this._config.instrumentationKey) {
                this._appInsights.loadAppInsights();
                this._config = this._appInsights.config;
                this._initialized = true;
            }
        }
    }

    setConfig(config: IConfiguration & IConfig): void {
        if (this._appInsights) {
            this._appInsights.config = { ...this._appInsights.config, ...this._config, ...config };
            this._config = this._appInsights.config;

            if (!this._initialized && this._isBrowser) {
                this._appInsights.loadAppInsights();
                this._config = this._appInsights.config;
                this._initialized = true;
            }
        } else {
            this._config = { ...this._config, ...config };
        }
    }

    createLogger(category: string): Logger {
        return new ApplicationInsightsLogger(category, this._appInsights);
    }

    setUserProperties(userId: string, accountId?: string): void {
        if (this._isBrowser && this._initialized && this._appInsights) {
            this._appInsights.setAuthenticatedUserContext(userId, accountId);
        }
    }

    clearUserProperties(): void {
        if (this._isBrowser && this._initialized && this._appInsights) {
            this._appInsights.clearAuthenticatedUserContext();
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
