import { Injectable } from '@nestjs/common';
import { environment } from 'src/environment/environment';
import { exec } from 'child_process';
const request = require('request');


@Injectable()
export class ConfigService {


    /**
     * Informations sur cette api (dont son environement dans thisApi.data :any[]) 
     */
    thisApi: any;

    /**
     * Liste des autres apis
     */
    apiList: any[];

    /**
     * Return -> url de l'api suivant son code
     * @param codeApi 
     */
    getApiUrl(codeApi) {
        if (this.apiList.length) {
            let api = this.apiList.find(el => el.code == codeApi)
            if (api) {
                return environment.production ? api.serveur + ':' + api.port : "https://api.noyeau.io/gateway/"+api.code;
            }
        }
        return '';
    }

    async getPort(){
        // while(!this.thisApi){
        //  console.log('test off');
        //     ;
        // }
        return this.thisApi.port
    }


    async createTypeOrmOptions(){
        if(!this.thisApi){
            await this.init()
        }
        return this.thisApi.data.bddConfig
    }


    /**
     * Fonction d'initialisation
     */
    async init() {
        return new Promise((resolve, reject) => {
            console.log('init');

            /**
             * On récupère les data de l'api
             */
            if (environment.production) {
                request.get({
                    url: environment.apiSystem + '/api/' + environment.apiCode,
                    headers: {
                        'Authorization': environment.apiKeyCode
                    }
                }, async (error: any, response, body: any) => {

                    if (!error && response.statusCode == 200) {
                        if (typeof body === "string") {
                            body = JSON.parse(body)
                        }
                        console.log(body);

                        this.apiList = body.list
                        this.thisApi = body.api

                        console.log(this.thisApi.data.bddConfig);
                        resolve(this.thisApi);
                        return
                    }
                    console.log('Erreur recup CONFIG -> Vérifier API SYSTEM err=>' + body)
                    reject(error)
                    return

                })
            }
            else {
                request.get({
                    url: 'https://api.noyeau.io/apiList',
                    headers: {
                        'Authorization': environment.apiKeyCode
                    }
                }, async (error: any, response, body: any) => {

                    if (!error && response.statusCode == 200) {
                        if (typeof body === "string") {
                            body = JSON.parse(body)
                        }
                        console.log(body);

                        this.apiList = body
                        this.thisApi = {
                            "label": "NOYEAU API Medias",
                            "code": "medias",
                            "description": "",
                            "open": true,
                            "activated": true,
                            "serveur": "http://localhost",
                            "port": 3001,
                            "role": null,
                            "repository": null,
                            data: { bddConfig: environment.bddConfig }
                        }

                        resolve(this.thisApi);
                        return
                    }
                    console.log('Erreur recup CONFIG -> Vérifier API SYSTEM err=>' + body)
                    reject(error)
                    return

                })
            }




        })
    }

   

}
