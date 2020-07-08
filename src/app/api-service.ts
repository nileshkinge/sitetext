import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,forkJoin, of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ResponseModel } from './models/response-model';
import { TranslateModel } from './models/translate-model';
import { Language } from './models/language';

const httpOptions = {
  headers: new HttpHeaders({  'Content-Type': 'application/text' }),  body: new Object()}

@Injectable()
export class ApiService {
  translatedData: any;
  constructor(private http: HttpClient) { }
  
  translate(model:TranslateModel): Observable<string> {
    return this.translate1(model)
        .pipe<string>(
          mergeMap(res => res)
        );
  }

  translate1(model:TranslateModel): Observable<any[]> {
    const translateCalls = [];
    model.l.forEach(locale => {
        const url = `https://translate.google.com/m?hl=${locale}&sl=en&q=${model.userText}`;
        const postCall = this.http.post<string>(url, {}, httpOptions)
                                  .pipe(
                                      map(res => res), 
                                      catchError(error => of(error))
                                  )
        translateCalls.push(postCall);
      });
    
    return forkJoin(translateCalls)
        .pipe<any[]>(
          map(res => res)
        );
  }

  processResponse(response: string[]): string{
    let processedResponse: string[] = [];
    response.forEach(res => {
      processedResponse.push(res);
      console.log(JSON.stringify(res));
    });
    return response[0];
  }

  getLanguages():Language[]{
    return [{ locale: 'en', selected: true, name: 'english', id: 9 },
            { locale: 'de', selected: true, name: 'german', id: 1031 },
            { locale: 'it', selected: true, name: 'italian', id: 1040 },
            { locale: 'pt', selected: true, name: 'portuguese', id: 1046 },
            { locale: 'zh-CN', selected: true, name: 'chinese', id: 2052 },
            { locale: 'en-GB', selected: true, name: 'en - united kingdom', id: 2057 },
            { locale: 'es', selected: true, name: 'spanish', id: 2058 },
            { locale: 'en-AU', selected: true, name: 'english - australia', id: 3081 },
            { locale: 'fr', selected: true, name: 'french', id: 3084 },
            { locale: 'ja', selected: true, name: 'japanese', id: 1041 },
            { locale: 'ko', selected: true, name: 'korean', id: 1042 },
            { locale: 'nl', selected: true, name: 'dutch', id: 1043 },
            { locale: 'pl', selected: true, name: 'polish', id: 1045 },
          ].sort(l => l.id);
  }

}
