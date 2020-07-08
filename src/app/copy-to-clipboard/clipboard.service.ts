import { DOCUMENT } from '@angular/platform-browser'
import { Inject, Injectable } from '@angular/core';

@Injectable()
export class ClipboardService {
  private document: Document;
  constructor(@Inject(DOCUMENT) doc: Document) {
    this.document = doc;
  }

  public copy(value: string): Promise<string> {
    if (value.length > 0) {
      var promise = new Promise<string>((resolve, reject): void => {
        var textarea = null;
        try {
          textarea = this.document.createElement("textarea");
          textarea.style.height = '0px';
          textarea.style.left = '-100px';
          textarea.style.opacity = '0';
          textarea.style.position = 'fixed';
          textarea.style.top = '-100px';
          textarea.style.width = '0px';
          this.document.body.appendChild(textarea);

          textarea.value = this.sanitizeResponse(value[0]);
          textarea.select();

          this.document.execCommand('copy');

          resolve(value);
        }
        finally {
          if (textarea && textarea.parentNode) {
            textarea.parentNode.removeChild(textarea);
          }
        }
      });
      return (promise);
    }
  }
  public sanitizeResponse(value: string): string {
    value = value.split("&#39;").join("''")
    value = value.split("&lt;").join("<")
    value = value.split("&gt;").join(">");

    return value;
  }
}
