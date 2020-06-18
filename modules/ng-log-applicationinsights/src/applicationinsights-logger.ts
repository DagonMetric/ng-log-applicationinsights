/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import {
    EventInfo,
    EventTimingInfo,
    LogInfo,
    LogLevel,
    Logger,
    PageViewInfo,
    PageViewTimingInfo
} from '@dagonmetric/ng-log';
import {
    IApplicationInsights,
    IEventTelemetry,
    IExceptionTelemetry,
    IPageViewTelemetry,
    ITraceTelemetry,
    SeverityLevel
} from '@microsoft/applicationinsights-web';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function toSeverityLevel(logLevel: LogLevel): SeverityLevel {
    if (logLevel === LogLevel.Critical) {
        return SeverityLevel.Critical;
    } else if (logLevel === LogLevel.Error) {
        return SeverityLevel.Error;
    } else if (logLevel === LogLevel.Warn) {
        return SeverityLevel.Warning;
    } else if (logLevel === LogLevel.Info) {
        return SeverityLevel.Information;
    } else {
        return SeverityLevel.Verbose;
    }
}

/**
 * Microsoft ApplicationInsights implementation for `Logger`.
 */
export class ApplicationInsightsLogger extends Logger {
    constructor(readonly name: string, public appInsights?: IApplicationInsights) {
        super();
    }

    log(logLevel: LogLevel, message: string | Error, logInfo?: LogInfo): void {
        if (!this.appInsights || logLevel === LogLevel.None) {
            return;
        }

        const severityLevel = toSeverityLevel(logLevel);

        if (logLevel === LogLevel.Error || logLevel === LogLevel.Critical) {
            const exceptionTelemetry: IExceptionTelemetry = {
                exception: typeof message === 'string' ? new Error(message) : message,
                severityLevel
            };
            if (logInfo && logInfo.properties) {
                exceptionTelemetry.properties = {
                    ...exceptionTelemetry.properties,
                    ...logInfo.properties
                };
            }
            if (logInfo && logInfo.measurements) {
                exceptionTelemetry.properties = {
                    ...exceptionTelemetry.properties,
                    ...logInfo.measurements
                };
            }
            this.appInsights.trackException(exceptionTelemetry);
        } else {
            const traceTelemetry: ITraceTelemetry = {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                message: typeof message === 'string' ? message : `${message}`,
                severityLevel
            };
            if (logInfo && logInfo.properties) {
                traceTelemetry.properties = logInfo.properties;
            }
            this.appInsights.trackTrace(traceTelemetry);
        }
    }

    startTrackPage(name?: string): void {
        if (!this.appInsights) {
            return;
        }

        this.appInsights.startTrackPage(name);
    }

    stopTrackPage(name?: string, pageViewInfo?: PageViewTimingInfo): void {
        if (!this.appInsights) {
            return;
        }

        if (pageViewInfo) {
            let properties: { [key: string]: unknown } | undefined;

            if (pageViewInfo.properties) {
                properties = { ...pageViewInfo.properties };
            }
            if (pageViewInfo.ref_uri != null) {
                properties = properties || {};
                properties.refUri = pageViewInfo.ref_uri;
            }
            if (pageViewInfo.page_type != null) {
                properties = properties || {};
                properties.pageType = pageViewInfo.page_type;
            }
            if (pageViewInfo.is_logged_in != null) {
                properties = properties || {};
                properties.isLoggedIn = pageViewInfo.is_logged_in;
            }
            if (pageViewInfo.measurements) {
                properties = {
                    ...properties,
                    ...pageViewInfo.measurements
                };
            }

            if (properties) {
                this.appInsights.stopTrackPage(name, pageViewInfo.uri, properties);
            } else {
                this.appInsights.stopTrackPage(name, pageViewInfo.uri);
            }
        } else {
            this.appInsights.stopTrackPage(name);
        }
    }

    trackPageView(pageViewInfo?: PageViewInfo): void {
        if (!this.appInsights) {
            return;
        }

        const pageViewTelemetry: IPageViewTelemetry = {};

        if (pageViewInfo) {
            if (pageViewInfo.name != null) {
                pageViewTelemetry.name = pageViewInfo.name;
            }
            if (pageViewInfo.uri != null) {
                pageViewTelemetry.uri = pageViewInfo.uri;
            }
            if (pageViewInfo.ref_uri != null) {
                pageViewTelemetry.refUri = pageViewInfo.ref_uri;
            }
            if (pageViewInfo.page_type != null) {
                pageViewTelemetry.pageType = pageViewInfo.page_type;
            }
            if (pageViewInfo.is_logged_in != null) {
                pageViewTelemetry.isLoggedIn = pageViewInfo.is_logged_in;
            }
            if (pageViewInfo.properties) {
                pageViewTelemetry.properties = {
                    ...pageViewTelemetry.properties,
                    ...pageViewInfo.properties
                };
            }
            if (pageViewInfo.measurements) {
                pageViewTelemetry.properties = {
                    ...pageViewTelemetry.properties,
                    ...pageViewInfo.measurements
                };
            }
        }

        this.appInsights.trackPageView(pageViewTelemetry);
    }

    startTrackEvent(name: string): void {
        if (!this.appInsights) {
            return;
        }

        this.appInsights.startTrackEvent(name);
    }

    stopTrackEvent(name: string, eventInfo?: EventTimingInfo): void {
        if (!this.appInsights) {
            return;
        }

        if (eventInfo) {
            let properties: { [key: string]: unknown } = {};

            if (eventInfo.properties) {
                properties = { ...eventInfo.properties };
            }

            if (eventInfo.measurements) {
                this.appInsights.stopTrackEvent(name, properties, eventInfo.measurements);
            } else {
                this.appInsights.stopTrackEvent(name, properties);
            }
        } else {
            this.appInsights.stopTrackEvent(name);
        }
    }

    trackEvent(eventInfo: EventInfo): void {
        if (!this.appInsights) {
            return;
        }

        const eventTelemetry: IEventTelemetry = {
            name: eventInfo.name
        };
        if (eventInfo.properties) {
            eventTelemetry.properties = {
                ...eventTelemetry.properties,
                ...eventInfo.properties
            };
        }
        if (eventInfo.measurements) {
            eventTelemetry.properties = {
                ...eventTelemetry.properties,
                ...eventInfo.measurements
            };
        }

        this.appInsights.trackEvent(eventTelemetry);
    }

    flush(): void {
        if (!this.appInsights) {
            return;
        }

        this.appInsights.flush();
    }
}
