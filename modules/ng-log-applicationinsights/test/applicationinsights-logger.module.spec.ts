import { TestBed } from '@angular/core/testing';

import { LOGGER_PROVIDER, LoggerProvider } from '@dagonmetric/ng-log';

import {
    APPLICATIONINSIGHTS_LOGGER_OPTIONS,
    ApplicationInsightsLoggerOptions,
    ApplicationInsightsLoggerProvider
} from '../src/applicationinsights-logger-provider';
import { ApplicationInsightsLoggerModule } from '../src/applicationinsights-logger.module';

describe('ApplicationInsightsLoggerModule', () => {
    it("should provide 'ApplicationInsightsLoggerProvider'", () => {
        TestBed.configureTestingModule({
            imports: [ApplicationInsightsLoggerModule]
        });

        const loggerProviders = TestBed.inject<ApplicationInsightsLoggerProvider[]>(LOGGER_PROVIDER);

        void expect(loggerProviders).toBeDefined();
        void expect((loggerProviders as LoggerProvider[])[0] instanceof ApplicationInsightsLoggerProvider).toBeTruthy();
    });

    describe('configure', () => {
        it("should provide 'APPLICATIONINSIGHTS_LOGGER_OPTIONS' value", () => {
            TestBed.configureTestingModule({
                imports: [
                    ApplicationInsightsLoggerModule.configure({
                        config: {
                            instrumentationKey: 'TEST'
                        }
                    })
                ]
            });

            const options = TestBed.inject<ApplicationInsightsLoggerOptions>(APPLICATIONINSIGHTS_LOGGER_OPTIONS);

            void expect(options).toBeDefined();
            void expect(options.config.instrumentationKey).toBe('TEST');
        });
    });
});
