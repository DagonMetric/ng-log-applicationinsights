// tslint:disable: no-floating-promises

import { LogLevel } from '@dagonmetric/ng-log';
import { ApplicationInsights, SeverityLevel } from '@microsoft/applicationinsights-web';

import { ApplicationInsightsLogger } from '../src/applicationinsights-logger';

describe('ApplicationInsightsLogger', () => {
    let logger: ApplicationInsightsLogger;
    let appInsights: ApplicationInsights;

    beforeEach(() => {
        appInsights = jasmine.createSpyObj<ApplicationInsights>(
            'appInsights', [
                'startTrackPage',
                'stopTrackPage',
                'trackPageView',
                'startTrackEvent',
                'stopTrackEvent',
                'trackEvent',
                'trackTrace',
                'trackException',
                'flush'
            ]);

        logger = new ApplicationInsightsLogger('test', appInsights);
    });

    it("should work with 'log' method", () => {
        const message = 'This is a message.';
        const properties = { key1: 'value1' };

        logger.log(LogLevel.Trace, message, { properties });
        expect(appInsights.trackTrace).toHaveBeenCalledWith({
            message,
            severityLevel: SeverityLevel.Verbose,
            properties
        });

        logger.log(LogLevel.Debug, message, { properties });
        expect(appInsights.trackTrace).toHaveBeenCalledWith({
            message,
            severityLevel: SeverityLevel.Verbose,
            properties
        });

        logger.log(LogLevel.Info, message, { properties });
        expect(appInsights.trackTrace).toHaveBeenCalledWith({
            message,
            severityLevel: SeverityLevel.Information,
            properties
        });

        logger.log(LogLevel.Warn, message, { properties });
        expect(appInsights.trackTrace).toHaveBeenCalledWith({
            message,
            severityLevel: SeverityLevel.Warning,
            properties
        });

        const err = new Error(message);

        logger.log(LogLevel.Error, err, {
            measurements: {
                avgPageLoadTime: 1
            },
            properties
        });
        expect(appInsights.trackException).toHaveBeenCalledWith({
            exception: err,
            severityLevel: SeverityLevel.Error,
            measurements: {
                avgPageLoadTime: 1
            },
            properties
        });
    });

    it("should work with 'startTrackPage' and 'stopTrackPage'", () => {
        const pageTitle = 'home';

        logger.startTrackPage(pageTitle);
        expect(appInsights.startTrackPage).toHaveBeenCalledWith(pageTitle);

        logger.stopTrackPage(pageTitle, {
            uri: '/home',
            measurements: {
                avgPageLoadTime: 1
            },
            properties: {
                key1: 'value1'
            }
        });
        expect(appInsights.stopTrackPage).toHaveBeenCalledWith(pageTitle, '/home', {
            measurements: {
                avgPageLoadTime: 1
            },
            properties: {
                key1: 'value1'
            }
        });
    });

    it("should work with 'trackPageView'", () => {
        const pageViewInfo = {
            name: 'home',
            uri: '/home',
            measurements: {
                avgPageLoadTime: 1
            },
            properties: {
                key1: 'value1'
            }
        };
        logger.trackPageView(pageViewInfo);
        expect(appInsights.trackPageView).toHaveBeenCalledWith(pageViewInfo);
    });

    it("should work with 'startTrackEvent' and 'stopTrackEvent'", () => {
        const eventName = 'event1';
        logger.startTrackEvent(eventName);
        expect(appInsights.startTrackEvent).toHaveBeenCalledWith(eventName);

        logger.stopTrackEvent(eventName, {
            eventCategory: 'test',
            measurements: {
                avgPageLoadTime: 1
            }
        });
        expect(appInsights.stopTrackEvent).toHaveBeenCalledWith(eventName, {
            eventCategory: 'test'
        }, {
                avgPageLoadTime: 1
            });
    });

    it("should work with 'trackEvent'", () => {
        const eventInfo = {
            name: 'event1',
            eventCategory: 'test',
            measurements: {
                avgPageLoadTime: 1
            },
            properties: {
                key1: 'value1'
            }
        };
        logger.trackEvent(eventInfo);
        expect(appInsights.trackEvent).toHaveBeenCalledWith(eventInfo);
    });

    it("should work with 'flush'", () => {
        logger.flush();
        expect(appInsights.flush).toHaveBeenCalled();

        // Coverage only
        const loggerWithoutAppInsights = new ApplicationInsightsLogger();
        loggerWithoutAppInsights.log(LogLevel.None, 'This message will not be tracked.');
        loggerWithoutAppInsights.startTrackPage('page1');
        loggerWithoutAppInsights.stopTrackPage('page1');
        loggerWithoutAppInsights.trackPageView({ name: 'page1' });
        loggerWithoutAppInsights.startTrackEvent('event1');
        loggerWithoutAppInsights.stopTrackEvent('event1');
        loggerWithoutAppInsights.trackEvent({ name: 'event1' });
        loggerWithoutAppInsights.flush();
    });
});
