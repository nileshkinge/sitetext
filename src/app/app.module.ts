import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CopyToClipboardModule } from './copy-to-clipboard/copy-to-clipboard.module';
import { AppComponent } from './app.component';
import { SitetextMessageEventComponent  } from './sitetext-message-event/sitetext-message-event.component';
import { ApiService } from './api-service';
import { SitetextGeneralComponent } from './sitetext-general/sitetext-general.component';

@NgModule({
  declarations: [
    AppComponent,
    SitetextMessageEventComponent,
    SitetextGeneralComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CopyToClipboardModule
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
