import { Directive, EventEmitter } from '@angular/core';
import { ClipboardService } from './clipboard.service';

@Directive({
  selector: '[translateClipboard]',
  inputs:['value: translateClipboard'],
  outputs:['copyEvent: clipboardCopy',
            'errorEvent: clipboardError'
          ],
  host: {    '(click)': 'copyToClipboard()'  }
})
export class ClipboardDirective {
  public copyEvent: EventEmitter<string>;
  public errorEvent: EventEmitter<Error>;
  public value: string;
  constructor(private service: ClipboardService) {     
    this.copyEvent = new EventEmitter();
    this.errorEvent = new EventEmitter();
    this.value = '';
  }

  public copyToClipboard():void{
    this.service.copy(this.value)
                .then((value:string):void => {
                  this.copyEvent.emit(value);
                })
                .catch((error: Error): void => {
                  this.errorEvent.emit(error)
                })
  }
}
