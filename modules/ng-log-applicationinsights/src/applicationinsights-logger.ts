/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { EventInfo, EventTimingInfo, Logger, LogInfo, LogLevel, PageViewInfo, PageViewTimingInfo } from '@dagonmetric/ng-log';
import { IApplicationInsights, IEventTelemetry, IPageViewTelemetry, SeverityLevel } from '@microsoft/applicationinsights-web';

/**
 * Microsoft ApplicationInsights implementation for `Logger`.
 */
export class ApplicationInsightsLogger extends Logger {
    constructor(readonly name?: string, public appInsights?: IApplicationInsights) {
        super();
    }

    log(logLevel: LogLevel, message: string | Error, logInfo?: LogInfo): void {
        if (!this.appInsights || logLevel === LogLevel.None) {
            return;
        }

        const severityLevel = ApplicationInsightsLogger.toSeverityLevel(logLevel);
        const measurements = logInfo && logInfo.measurements ?
            logInfo.measurements : undefined;
        const extraProperties = logInfo && logInfo.properties ?
            logInfo.properties : undefined;

        if (logLevel === LogLevel.Error || logLevel === LogLevel.Critical) {
            this.appInsights.trackException({
                exception: typeof message === 'string' ? new Error(message) : message,
                severityLevel,
                measurements,
                properties: extraProperties
            });
        } else {
            this.appInsights.trackTrace({
                message: typeof message === 'string' ? message : `${message}`,
                severityLevel,
                properties: extraProperties
            });
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

        const uri = pageViewInfo && pageViewInfo.uri ? pageViewInfo.uri : undefined;

        const customProperties = ApplicationInsightsLogger.filterPageViewCustomProperties(pageViewInfo);
        const pageViewTelemetry: IPageViewTelemetry = {
            ...customProperties
        };
        if (pageViewInfo && pageViewInfo.measurements) {
            pageViewTelemetry.measurements = pageViewInfo.measurements;
        }
        if (pageViewInfo && pageViewInfo.properties) {
            pageViewTelemetry.properties = pageViewInfo.properties;
        }

        this.appInsights.stopTrackPage(name, uri, pageViewTelemetry);
    }

    trackPageView(pageViewInfo?: PageViewInfo): void {
        if (!this.appInsights) {
            return;
        }

        const customProperties = ApplicationInsightsLogger.filterPageViewCustomProperties(pageViewInfo);

        const pageViewTelemetry: IPageViewTelemetry = {
            ...customProperties
        };
        if (pageViewInfo && pageViewInfo.name) {
            pageViewTelemetry.name = pageViewInfo.name;
        }
        if (pageViewInfo && pageViewInfo.uri) {
            pageViewTelemetry.uri = pageViewInfo.uri;
        }
        if (pageViewInfo && pageViewInfo.measurements) {
            pageViewTelemetry.measurements = pageViewInfo.measurements;
        }
        if (pageViewInfo && pageViewInfo.properties) {
            pageViewTelemetry.properties = pageViewInfo.properties;
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

        const customProperties = ApplicationInsightsLogger.filterEventCustomProperties(eventInfo);
        const extraProperties = eventInfo && eventInfo.properties ? eventInfo.properties : undefined;
        const measurements = eventInfo && eventInfo.measurements ? eventInfo.measurements : undefined;

        this.appInsights.stopTrackEvent(name, {
            ...extraProperties,
            ...customProperties
        }, measurements);
    }

    trackEvent(eventInfo: EventInfo): void {
        if (!this.appInsights) {
            return;
        }

        const customProperties = ApplicationInsightsLogger.filterEventCustomProperties(eventInfo);
        const eventTelemetry: IEventTelemetry = {
            ...customProperties,
            name: eventInfo.name
        };
        if (eventInfo.measurements) {
            eventTelemetry.measurements = eventInfo.measurements;
        }
        if (eventInfo.properties) {
            eventTelemetry.properties = eventInfo.properties;
        }

        this.appInsights.trackEvent(eventTelemetry);
    }

    flush(): void {
        if (!this.appInsights) {
            return;
        }

        this.appInsights.flush();
    }

    private static toSeverityLevel(logLevel: LogLevel): SeverityLevel {
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

    private static filterPageViewCustomProperties(
        properties?: PageViewTimingInfo,
        excludeKeys: (keyof PageViewInfo | 'name')[]
            = ['name', 'uri', 'customMap', 'measurements', 'properties']): { [key: string]: string } | undefined {
        if (!properties) {
            return undefined;
        }
        // tslint:disable-next-line: no-any
        const mappedProperties: { [key: string]: any } = {};
        const props = properties;

        Object.keys(props)
            .filter((key: keyof PageViewInfo) => excludeKeys.length === 0 || !excludeKeys.includes(key))
            .forEach((key: keyof PageViewTimingInfo) => {
                mappedProperties[key] = props[key];
            });

        return mappedProperties;
    }

    private static filterEventCustomProperties(
        properties?: EventTimingInfo,
        excludeKeys: (keyof EventInfo | 'name')[]
            = ['name', 'customMap', 'measurements', 'properties']): { [name: string]: string } | undefined {
        if (!properties) {
            return undefined;
        }
        // tslint:disable-next-line: no-any
        const mappedProperties: { [name: string]: any } = {};
        const props = properties;

        Object.keys(props)
            .filter((key: keyof EventInfo) => excludeKeys.length === 0 || !excludeKeys.includes(key))
            .forEach((key: keyof EventTimingInfo) => {
                mappedProperties[key] = props[key];
            });

        return mappedProperties;
    }
}
