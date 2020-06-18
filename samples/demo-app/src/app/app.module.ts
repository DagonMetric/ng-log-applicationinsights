import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// ng-log
import { LogModule } from '@dagonmetric/ng-log';
import { ApplicationInsightsLoggerModule } from '@dagonmetric/ng-log-applicationinsights';

import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [
        CommonModule,
        BrowserModule,

        // ng-log imports
        //
        LogModule,
        ApplicationInsightsLoggerModule.configure({
            config: {
                instrumentationKey: navigator.webdriver ? '' : 'b92a4655-8806-45b6-a979-67ebce91d92f'
                // disableTelemetry: navigator.webdriver ? true : false
                // maxBatchInterval: navigator.webdriver ? 1000 : 10000
            }
        })
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
