import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardDirective } from './clipboard.directive';
import { ClipboardService } from './clipboard.service';
import { DOCUMENT } from '@angular/platform-browser'

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [ClipboardDirective],
  providers: [ClipboardService, Document],
  declarations: [ClipboardDirective]
})
export class CopyToClipboardModule { }
