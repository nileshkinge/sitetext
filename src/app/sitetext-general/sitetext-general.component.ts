import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray, ValidatorFn} from '@angular/forms';
import { ApiService } from '../api-service';
import { TranslateModel } from '../models/translate-model';
import { ResponseModel } from '../models/response-model';
import { forkJoin } from 'rxjs';
import { Locale } from '../models/locale';
import { Language } from '../models/language';

@Component({
  selector: 'translate-plain-text',
  templateUrl: './sitetext-general.component.html',
  styleUrls: ['./sitetext-general.component.css']
})
export class SitetextGeneralComponent implements OnInit {
  viewmodel : { key: string, page:string, text:string};
  languages: Language[];
  l:Locale[];
  plainTextForm: FormGroup;
  query: string = '';
  error:string;
  constructor(private formBuider: FormBuilder, private translateApi: ApiService) { }

  createForm() {
    const controlLaunguages = this.languages.map(l => new FormControl(true));
    this.plainTextForm = this.formBuider.group({
      key: ['', Validators.required],
      page:[this.viewmodel.page, Validators.required],
      text: ['', Validators.required],
      languages: new FormArray([], this.minSelectedCheckboxes(1))
    });
    this.addCheckboxes();
  }
  get languagesFormArray() {
    return this.plainTextForm.controls.languages as FormArray;
  }
  private addCheckboxes() {
    this.languages.forEach(() => this.languagesFormArray.push(new FormControl(true)));
  }
  minSelectedCheckboxes(min = 1) {
  const validator: ValidatorFn = (formArray: FormArray) => {
    const totalSelected = formArray.controls
      // get a list of checkbox values (boolean)
      .map(control => control.value)
      // total up the number of checked checkboxes
      .reduce((prev, next) => next ? prev + next : prev, 0);

    // if the total is not greater than the minimum, return the error message
    return totalSelected >= min ? null : {'minSelection': {value: min}};
  };

  return validator;
}
  initModel(){
    this.viewmodel = { key: '', page:"~/new-lms/", text:""};
    this.languages = this.translateApi.getLanguages();
    this.l =  this.languages.map(language => { return {'locale': language.locale}})
  }
  translate(){ 
    this.query = '';        
    const selectedLanguges = this.plainTextForm.value.languages
      .map((checked, i) => checked ? this.languages[i].locale : null)
      .filter(v => v !== null);    
    const nameModel: TranslateModel = { userText: this.plainTextForm.value.text, l:selectedLanguges };
    this.translateApi.translate(nameModel)
                     .subscribe(response => {                         
                        this.formatTODisplay(response); 
                      },
                      error => { console.log(error); });
  }
  formatTODisplay(data: any){
    if(!data){
      return '';
    }    
    if(data.status !== 200){
      this.error = data.message;
    }

    const value = data.error.text;
    const url = data.url;
    const textMagicPhrase = 'class="t0">';
    const languageMagicPhrase = 'm?hl=';
    const translatedText = value.substring(value.indexOf(textMagicPhrase) + textMagicPhrase.length).split('<')[0];
    //const locale = value.substring(value.indexOf(languageMagicPhrase) + languageMagicPhrase.length).split('&')[0];
    const locale = url.substring(url.indexOf(languageMagicPhrase) + languageMagicPhrase.length).split('&')[0];
    //console.log(locale);
    const language: Language = this.languages.find(l => locale === l.locale);
    // console.log(translatedText);
    //console.log(language)
    return this.buildQuery(translatedText, language);
  }
  buildQuery(value:string, language: Language){
      this.query = this.query + `
      --${language.name}
      EXEC Translation_NewSiteText @sPageName =N'${this.plainTextForm.value.page}',@sKey =N'${this.plainTextForm.value.key}', @sSiteText=N'${value}',@iHR_OrganizationID=NULL,@iLanguageID=${language.id}`;    
  }
  sanitizeResponse(value: string): string{
    value = value.split("&#39;").join("''")
    value = value.split("&lt;").join("<")
    value = value.split("&gt;").join(">");

    return value
  }
  logSuccess(event:any){

  }
  logError(event:any){

  }
  ngOnInit() {
    this.initModel();
    this.createForm();
  }

}
