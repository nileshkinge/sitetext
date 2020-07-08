import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ApiService } from '../api-service';
import { TranslateModel } from '../models/translate-model';
import { ResponseModel, TranslatedResponseModel } from '../models/response-model';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Locale } from '../models/locale';
import { Language } from '../models/language';

@Component({
  selector: 'translate-message-event',
  templateUrl: './sitetext-message-event.component.html',
  styleUrls: ['./sitetext-message-event.component.css']
})
export class SitetextMessageEventComponent implements OnInit {
  messageForm: FormGroup;
  viewmodel: { eventId: number, eventConstant:string, name: string, description: string, subject:string, body:string };
  translateModel: TranslateModel = new TranslateModel();  
  translatedResponseModels:TranslatedResponseModel[] = [];
  languages: Language[];
  l: Locale[];
  query:string;
  error:string;
  mValue:string;
  mName:string;
  mDescription:string;
  mSubjectContent:string;
  mBody:string;
  value;     
  locale:string;
  language: Language;
  textMagicPhrase = 'class="t0">';
  languageMagicPhrase = 'action="/m?hl=';
  languageIndex:number= 0;

  constructor(private formBuider: FormBuilder, private translateApi: ApiService ) { }

  initModel(){    
    this.viewmodel = { eventId: 0, eventConstant:"", name:"", description:"", subject:"", body:"" };
    this.languages = this.translateApi.getLanguages();
    this.l =  this.languages.map(language => { return {'locale': language.locale}})
  }
  createForm() {
    this.messageForm = this.formBuider.group({
      eventId: [this.viewmodel.eventId, Validators.required],
      messageEventConstant: [this.viewmodel.eventConstant, Validators.required],
      messageName: [this.viewmodel.name, Validators.required],
      messageDescription: [this.viewmodel.description, Validators.required],
      messageSubject: [this.viewmodel.subject, Validators.required],
      messageBody: [this.viewmodel.body, Validators.required]
    });
  }
  translate(){ 
    this.translatedResponseModels = [];
    this.query = `
    DECLARE @newEventID int, @sMessageName varchar(200),@sMessageDesc varchar(200),@sSubjectContent varchar(1000),@sBodyContent varchar(1000), @iLanguageId int, @messageTypeId int;
    DECLARE @iMessageID int, @iContentID_Subject int, @iContentID_Body int
    DECLARE @sEventConstant varchar(100);
    set @sEventConstant = N'${this.messageForm.value.messageEventConstant}'
    
    IF NOT EXISTS(SELECT * FROM tMessage_Event WHERE sEventConstant = N'${this.messageForm.value.messageEventConstant}') 
    BEGIN
      -- add new message event for Assignment DueDate
      SET IDENTITY_INSERT  tmessage_event ON
      SET @newEventID = ${this.messageForm.value.eventId}
      insert into tmessage_event (iMessage_EventID,sEventConstant, bHidden, bActive, iMessage_PostTypeID) 
        VALUES (@newEventID, N'${this.messageForm.value.messageEventConstant}', 0, 1, 2)      
      insert into tmessage_eventlanguage (iMessage_EventID, iLanguageID, sEvent, sDescription, bActive) 
        VALUES (@newEventID, 9, N'${this.messageForm.value.messageName}', N'${this.messageForm.value.messageDescription}', 1)
    END

    `;

    let nameModel: TranslateModel;
    let descriptionModel: TranslateModel;
    let subjectModel: TranslateModel;
    let bodyModel: TranslateModel; 
    let models:TranslateModel[] = [
      { userText: this.messageForm.value.messageName, l:this.l },
      { userText: this.messageForm.value.messageDescription, l:this.l },
      { userText: this.messageForm.value.messageSubject, l:this.l },
      { userText: this.messageForm.value.messageBody, l:this.l }
    ]; 
    
      nameModel = { userText: this.messageForm.value.messageName, l:this.l };    
      descriptionModel = { userText: this.messageForm.value.messageDescription, l:this.l };    
      subjectModel = { userText: this.messageForm.value.messageSubject, l:this.l };    
      bodyModel = { userText: this.messageForm.value.messageBody, l:this.l };

      for (let index = 0; index < models.length; index++) {        
        this.translateApi.translate(models[index])
                        .subscribe(response => {                                       
                                      this.languageIndex++; 
                                      this.formatToDisplay(response, index);
                                      if(this.languageIndex === 36){
                                        this.buildQuery();
                                      }
                                      
                                    },
                                    error => { console.log(error); })
      }    
  }
  formatToDisplay(data:any, index:number){
     let addModel: boolean;
     if(!data){
      return '';
    }            

     if(data.status !== 200){
        this.error = data.message;
      }
      this.value = data.error.text;           
      this.mValue = this.value.substring(this.value.indexOf(this.textMagicPhrase) + this.textMagicPhrase.length).split('<')[0];
      this.locale = this.value.substring(this.value.indexOf(this.languageMagicPhrase) + this.languageMagicPhrase.length).split('&')[0];
      this.language = this.languages.find(l => this.locale.includes(l.locale));

      let translatedResponseModel = this.translatedResponseModels.find(trm => trm.languageId === this.language.id);
      
      if(!translatedResponseModel){
        addModel = true; 
        translatedResponseModel = { languageId: this.language.id, languageName:this.language.name, name: '', description: '', subject:'', body:'' }; }

      if(index === 0){ translatedResponseModel.name = this.sanitizeResponse(this.mValue);}
      if(index === 1){ translatedResponseModel.description =  this.sanitizeResponse(this.mValue);}
      if(index === 2){ translatedResponseModel.subject =  this.sanitizeResponse(this.mValue);}
      if(index === 3){ translatedResponseModel.body =  this.sanitizeResponse(this.mValue);      }
      
      if(addModel){      this.translatedResponseModels.push(translatedResponseModel);}
  }
  buildQuery(){
    this.translatedResponseModels.forEach(trm => {
    
    this.query = this.query + `
      --${trm.languageName}
      SELECT  @sMessageName = N'${trm.name}',
              @sMessageDesc = N'${trm.description}',
              @sSubjectContent = N'${trm.subject}',
              @sBodyContent = N'<html>      
                                <head><title></title></head>      
                                <body>          
                                    ${trm.body}				 
                                </body> 
                                </html>', 
              @iLanguageId = ${trm.languageId}
    
      set @messageTypeId = 1 -- email, 2 message center
      exec _wsp_CreateOrUpdateMessage @eventConstant = @sEventConstant, @messageName = @sMessageName, @messageDescription = @sMessageDesc, @messageSubject = @sSubjectContent, @messageBody = @sBodyContent, @languageId = @iLanguageId, @messageTypeId = @messageTypeId
      set @messageTypeId = 2 -- email, 2 message center
      exec _wsp_CreateOrUpdateMessage @eventConstant = @sEventConstant, @messageName = @sMessageName, @messageDescription = @sMessageDesc, @messageSubject = @sSubjectContent, @messageBody = @sBodyContent, @languageId = @iLanguageId, @messageTypeId = @messageTypeId                  
      `;
    });
  }
  formatToDisplay1(data:any[]){
     if(!data){
      return '';
    }            
    let mName:string;
    let mDescription:string;
    let mSubjectContent:string;
    let mBody:string;
    let value;     
    let locale:string;
    let language: Language;
    const textMagicPhrase = 'class="t0">';
    const languageMagicPhrase = 'action="/m?hl=';
    
     //name
     if(data[0].status !== 200){
        this.error = data[0].message;
      }
      value = data[0].error.text;           
      mName = value.substring(value.indexOf(textMagicPhrase) + textMagicPhrase.length).split('<')[0];
      locale = value.substring(value.indexOf(languageMagicPhrase) + languageMagicPhrase.length).split('&')[0];
      language = this.languages.find(l => locale.includes(l.locale));

      //description
      if(data[1].status !== 200){
        this.error = data[1].message;
      }
      value = data[1].error.text;           
      mDescription = value.substring(value.indexOf(textMagicPhrase) + textMagicPhrase.length).split('<')[0];

      //subject
      if(data[2].status !== 200){
        this.error = data[2].message;
      }
      value = data[2].error.text;           
      mSubjectContent = value.substring(value.indexOf(textMagicPhrase) + textMagicPhrase.length).split('<')[0];

      //body
      if(data[3].status !== 200){
        this.error = data[3].message;
      }
      value = data[3].error.text;           
      mBody = value.substring(value.indexOf(textMagicPhrase) + textMagicPhrase.length).split('<')[0];
    

      mName = this.sanitizeResponse(mName);
      mDescription = this.sanitizeResponse(mDescription);
      mSubjectContent = this.sanitizeResponse(mSubjectContent);
      mBody = this.sanitizeResponse(mBody);      
      
      this.query = this.query + `
      --${language.name}
      EXEC [dbo].[_wsp_message_event_add]
              @newEventID = @newEventID,
              @sMessageName = N'${mName}',
              @sMessageDesc = N'${mDescription}',
              @sSubjectContent = N'${mSubjectContent}',
              @sBodyContent = N'<html>      
                          <head><title></title></head>      
                        <body>          
                          ${mBody} 					 
                         </body> 
                       </html>',
              @iLanguageId = ${language.id}
      `;          
  } 
  sanitizeResponse(value: string): string{
    value = value.split("&#39;").join("''")
    value = value.split("&lt;").join("<")
    value = value.split("&gt;").join(">");

    return value
  }
  public logError( error: Error ) : void {
    console.group( "Clipboard Error" );
    console.error( error );
    console.groupEnd();
  }
  logSuccess( value: string ) : void {
    console.group( "Clipboard Success" );
    console.log( value );
    console.groupEnd();
  }

  ngOnInit() {
    this.initModel();
    this.createForm();
  }

}
