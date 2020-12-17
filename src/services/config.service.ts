import { Injectable } from '@nestjs/common';
import { environment } from 'src/environment/environment';
import { exec } from 'child_process';
const request = require('request');


@Injectable()
export class ConfigService {


    constructor() {
        this.init()
    }

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
                return  api.serveur + ':' + api.port;
            }
        }
        return '';
    }

    async getPort() {
        // while(!this.thisApi){
        //  console.log('test off');
        //     ;
        // }
        return this.thisApi.port
    }


    async createTypeOrmOptions() {
        if (!this.thisApi) {
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
                    resolve(this.thisApi);
                    return
                }
                console.log('Erreur recup CONFIG -> Vérifier API SYSTEM err=>' + body)
                reject(error)
                return

            })







        })
    }



}
