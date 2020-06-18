import { LogLevel } from '@dagonmetric/ng-log';
import { ApplicationInsights, SeverityLevel } from '@microsoft/applicationinsights-web';

import { ApplicationInsightsLogger } from '../src/applicationinsights-logger';

describe('ApplicationInsightsLogger', () => {
    let logger: ApplicationInsightsLogger;
    let appInsights: ApplicationInsights;

    beforeEach(() => {
        appInsights = jasmine.createSpyObj<ApplicationInsights>('appInsights', [
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
        const err = new Error(message);
        const properties = { key1: 'value1' };

        logger.log(LogLevel.Trace, err);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackTrace).toHaveBeenCalledWith({
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            message: `${err}`,
            severityLevel: SeverityLevel.Verbose
        });

        logger.log(LogLevel.Debug, message);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackTrace).toHaveBeenCalledWith({
            message,
            severityLevel: SeverityLevel.Verbose
        });

        logger.log(LogLevel.Info, message, { properties });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackTrace).toHaveBeenCalledWith({
            message,
            severityLevel: SeverityLevel.Information,
            properties
        });

        logger.log(LogLevel.Warn, message, { properties });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackTrace).toHaveBeenCalledWith({
            message,
            severityLevel: SeverityLevel.Warning,
            properties
        });

        logger.log(LogLevel.Error, message);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackException).toHaveBeenCalledWith({
            exception: err,
            severityLevel: SeverityLevel.Error
        });

        logger.log(LogLevel.Error, err, { properties });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackException).toHaveBeenCalledWith({
            exception: err,
            severityLevel: SeverityLevel.Error,
            properties
        });

        logger.log(LogLevel.Critical, err, {
            measurements: {
                avg_page_load_time: 1
            },
            properties
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackException).toHaveBeenCalledWith({
            exception: err,
            severityLevel: SeverityLevel.Critical,
            properties: {
                key1: 'value1',
                avg_page_load_time: 1
            }
        });
    });

    it("should work with 'startTrackPage' and 'stopTrackPage'", () => {
        logger.startTrackPage('page1');
        logger.stopTrackPage('page1');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.startTrackPage).toHaveBeenCalledWith('page1');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.stopTrackPage).toHaveBeenCalledWith('page1');

        logger.startTrackPage('page2');
        logger.stopTrackPage('page2', {
            uri: '/page2'
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.startTrackPage).toHaveBeenCalledWith('page2');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.stopTrackPage).toHaveBeenCalledWith('page2', '/page2');

        logger.startTrackPage('page3');
        logger.stopTrackPage('page3', {
            uri: '/page3',
            ref_uri: 'https://somewhere.com/'
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.startTrackPage).toHaveBeenCalledWith('page3');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.stopTrackPage).toHaveBeenCalledWith('page3', '/page3', {
            refUri: 'https://somewhere.com/'
        });

        logger.startTrackPage('page4');
        logger.stopTrackPage('page4', {
            uri: '/page4',
            page_type: 'testPage'
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.startTrackPage).toHaveBeenCalledWith('page4');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.stopTrackPage).toHaveBeenCalledWith('page4', '/page4', {
            pageType: 'testPage'
        });

        logger.startTrackPage('page5');
        logger.stopTrackPage('page5', {
            uri: '/page5',
            is_logged_in: true
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.startTrackPage).toHaveBeenCalledWith('page5');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.stopTrackPage).toHaveBeenCalledWith('page5', '/page5', {
            isLoggedIn: true
        });

        logger.startTrackPage('page6');
        logger.stopTrackPage('page6', {
            uri: '/page6',
            properties: {
                key1: 'value1'
            }
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.startTrackPage).toHaveBeenCalledWith('page6');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.stopTrackPage).toHaveBeenCalledWith('page6', '/page6', {
            key1: 'value1'
        });

        logger.startTrackPage('page7');
        logger.stopTrackPage('page7', {
            uri: '/page7',
            measurements: {
                avg_page_load_time: 1
            }
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.startTrackPage).toHaveBeenCalledWith('page7');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.stopTrackPage).toHaveBeenCalledWith('page7', '/page7', {
            avg_page_load_time: 1
        });

        logger.startTrackPage('page8');
        logger.stopTrackPage('page8', {
            uri: '/page8',
            ref_uri: 'https://somewhere.com/',
            page_type: 'testPage',
            is_logged_in: false,
            measurements: {
                avg_page_load_time: 1
            },
            properties: {
                key1: 'value1'
            }
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.startTrackPage).toHaveBeenCalledWith('page8');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.stopTrackPage).toHaveBeenCalledWith('page8', '/page8', {
            key1: 'value1',
            refUri: 'https://somewhere.com/',
            pageType: 'testPage',
            isLoggedIn: false,
            avg_page_load_time: 1
        });
    });

    it("should work with 'trackPageView'", () => {
        logger.trackPageView();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackPageView).toHaveBeenCalledWith({});

        logger.trackPageView({
            name: 'page1'
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackPageView).toHaveBeenCalledWith({
            name: 'page1'
        });

        logger.trackPageView({
            uri: '/page2'
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackPageView).toHaveBeenCalledWith({
            uri: '/page2'
        });

        logger.trackPageView({
            ref_uri: 'https://somewhere.com/'
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackPageView).toHaveBeenCalledWith({
            refUri: 'https://somewhere.com/'
        });

        logger.trackPageView({
            page_type: 'testPage'
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackPageView).toHaveBeenCalledWith({
            pageType: 'testPage'
        });

        logger.trackPageView({
            is_logged_in: true
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackPageView).toHaveBeenCalledWith({
            isLoggedIn: true
        });

        logger.trackPageView({
            properties: {
                key1: 'value1'
            }
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackPageView).toHaveBeenCalledWith({
            properties: {
                key1: 'value1'
            }
        });

        logger.trackPageView({
            name: 'home',
            uri: '/home',
            ref_uri: 'https://somewhere.com/',
            page_type: 'testPage',
            is_logged_in: false,
            measurements: {
                avgPageLoadTime: 1
            },
            properties: {
                key1: 'value1'
            }
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackPageView).toHaveBeenCalledWith({
            name: 'home',
            uri: '/home',
            refUri: 'https://somewhere.com/',
            pageType: 'testPage',
            isLoggedIn: false,
            properties: {
                key1: 'value1',
                avgPageLoadTime: 1
            }
        });
    });

    it("should work with 'startTrackEvent' and 'stopTrackEvent'", () => {
        logger.startTrackEvent('event1');
        logger.stopTrackEvent('event1');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.startTrackEvent).toHaveBeenCalledWith('event1');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.stopTrackEvent).toHaveBeenCalledWith('event1');

        logger.stopTrackEvent('event4', {
            properties: {
                key1: 'value1'
            },
            measurements: {
                avg_page_load_time: 1
            }
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.stopTrackEvent).toHaveBeenCalledWith(
            'event4',
            {
                key1: 'value1'
            },
            {
                avg_page_load_time: 1
            }
        );
    });

    it("should work with 'trackEvent'", () => {
        logger.trackEvent({
            name: 'event1'
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackEvent).toHaveBeenCalledWith({
            name: 'event1'
        });

        logger.trackEvent({
            name: 'event2',
            measurements: {
                avgPageLoadTime: 1
            },
            properties: {
                key1: 'value1'
            }
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.trackEvent).toHaveBeenCalledWith({
            name: 'event2',
            properties: {
                key1: 'value1',
                avgPageLoadTime: 1
            }
        });
    });

    it("should work with 'flush'", () => {
        logger.flush();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        void expect(appInsights.flush).toHaveBeenCalled();

        // Coverage only
        const loggerWithoutAppInsights = new ApplicationInsightsLogger('');
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
