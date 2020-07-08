import {TranslatedText} from './translated-text'

export class ResponseModel {
    translatedText: TranslatedText;    
}
export class TranslatedResponseModel
{
  languageId: number;
  languageName:string; 
  name: string;
  description: string;
  subject:string;
  body:string;
}
