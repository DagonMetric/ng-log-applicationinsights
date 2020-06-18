import { TestBed } from '@angular/core/testing';

import { LogLevel } from '@dagonmetric/ng-log';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

import { ApplicationInsightsLogger } from '../src/applicationinsights-logger';
import {
    APPLICATIONINSIGHTS_LOGGER_OPTIONS,
    ApplicationInsightsLoggerProvider
} from '../src/applicationinsights-logger-provider';

describe('ApplicationInsightsLoggerProvider', () => {
    let loggerProvider: ApplicationInsightsLoggerProvider;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ApplicationInsightsLoggerProvider,
                {
                    provide: APPLICATIONINSIGHTS_LOGGER_OPTIONS,
                    useValue: {
                        config: {
                            instrumentationKey: 'TEST'
                        }
                    }
                }
            ]
        });

        loggerProvider = TestBed.inject<ApplicationInsightsLoggerProvider>(ApplicationInsightsLoggerProvider);
    });

    it('should be created', () => {
        void expect(loggerProvider).toBeDefined();
        void expect(loggerProvider.name).toBe('applicationinsights');
    });

    it("should create a new logger instance with 'createLogger' method", () => {
        const logger = loggerProvider.createLogger('test');
        void expect(logger instanceof ApplicationInsightsLogger).toBeTruthy();
        void expect((logger as ApplicationInsightsLogger).name).toBe('test');
    });

    it("should able to call 'setConfig' with  with eager initialization", () => {
        const appInsights = loggerProvider.appInsights as ApplicationInsights;
        loggerProvider.setConfig({
            instrumentationKey: 'TESTING'
        });
        void expect(appInsights.config.instrumentationKey).toBe('TESTING');
    });

    it("should able to call 'setConfig' with lazy initialization", () => {
        const loggerProvider2 = new ApplicationInsightsLoggerProvider('browser');
        loggerProvider2.setConfig({
            instrumentationKey: 'TESTING'
        });

        const appInsights = loggerProvider2.appInsights as ApplicationInsights;
        void expect(appInsights.config.instrumentationKey).toBe('TESTING');
    });

    it("should able to call 'setConfig' with non platform browser", () => {
        const loggerProvider2 = new ApplicationInsightsLoggerProvider('server');
        loggerProvider2.setConfig({
            instrumentationKey: 'TESTING'
        });

        void expect(loggerProvider2.appInsights).toBeUndefined();
    });

    it("should work with 'setUserProperties'", () => {
        const appInsights = loggerProvider.appInsights as ApplicationInsights;
        spyOn(appInsights, 'setAuthenticatedUserContext');

        const userId = 'user1';
        const accountId = 'account1';
        loggerProvider.setUserProperties(userId, accountId);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(appInsights.setAuthenticatedUserContext).toHaveBeenCalledWith(userId, accountId);

        // Coverage only, do nothing
        const loggerProvider2 = new ApplicationInsightsLoggerProvider('server');
        loggerProvider2.setUserProperties(userId, accountId);
    });

    it("should work with 'clearUserProperties'", () => {
        const appInsights = loggerProvider.appInsights as ApplicationInsights;
        spyOn(appInsights, 'clearAuthenticatedUserContext');

        loggerProvider.clearUserProperties();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        void expect(appInsights.clearAuthenticatedUserContext).toHaveBeenCalled();

        // Coverage only, do nothing
        const loggerProvider2 = new ApplicationInsightsLoggerProvider('server');
        loggerProvider2.clearUserProperties();
    });

    it("should work with 'log'", () => {
        const currentLogger = loggerProvider.currentLogger;
        spyOn(currentLogger, 'log');

        const logLevel = LogLevel.Info;
        const msg = 'This is a message.';
        const logInfo = { properties: { key1: 'value1' } };
        loggerProvider.log(logLevel, msg, logInfo);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(currentLogger.log).toHaveBeenCalledWith(logLevel, msg, logInfo);
    });

    it("should work with 'startTrackPage'", () => {
        const currentLogger = loggerProvider.currentLogger;
        spyOn(currentLogger, 'startTrackPage');

        loggerProvider.startTrackPage('page1');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(currentLogger.startTrackPage).toHaveBeenCalledWith('page1');
    });

    it("should work with 'stopTrackPage'", () => {
        const currentLogger = loggerProvider.currentLogger;
        spyOn(currentLogger, 'stopTrackPage');

        const name = 'page1';
        const pageViewInfo = { uri: '/home' };
        loggerProvider.stopTrackPage(name, pageViewInfo);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(currentLogger.stopTrackPage).toHaveBeenCalledWith(name, pageViewInfo);
    });

    it("should work with 'trackPageView'", () => {
        const currentLogger = loggerProvider.currentLogger;
        spyOn(currentLogger, 'trackPageView');

        const pageViewInfo = { name: 'page1', uri: '/home' };
        loggerProvider.trackPageView(pageViewInfo);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(currentLogger.trackPageView).toHaveBeenCalledWith(pageViewInfo);
    });

    it("should work with 'startTrackEvent'", () => {
        const currentLogger = loggerProvider.currentLogger;
        spyOn(currentLogger, 'startTrackEvent');

        loggerProvider.startTrackEvent('event1');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(currentLogger.startTrackEvent).toHaveBeenCalledWith('event1');
    });

    it("should work with 'stopTrackEvent'", () => {
        const currentLogger = loggerProvider.currentLogger;
        spyOn(currentLogger, 'stopTrackEvent');

        const name = 'event1';
        const eventInfo = { properties: { key1: 'value1' } };
        loggerProvider.stopTrackEvent(name, eventInfo);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(currentLogger.stopTrackEvent).toHaveBeenCalledWith(name, eventInfo);
    });

    it("should work with 'trackEvent'", () => {
        const currentLogger = loggerProvider.currentLogger;
        spyOn(currentLogger, 'trackEvent');

        const eventInfo = { name: 'event1', eventCategory: 'test' };
        loggerProvider.trackEvent(eventInfo);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(currentLogger.trackEvent).toHaveBeenCalledWith(eventInfo);
    });

    it("should work with 'flush'", () => {
        const currentLogger = loggerProvider.currentLogger;
        spyOn(currentLogger, 'flush');

        loggerProvider.flush();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        void expect(currentLogger.flush).toHaveBeenCalled();
    });
});
