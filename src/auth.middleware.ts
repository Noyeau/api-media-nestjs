import { Injectable, NestMiddleware, HttpService } from '@nestjs/common';
import { environment } from './environment/environment';

@Injectable()
export class AuthMiddleware implements NestMiddleware {

  constructor(private httpService: HttpService) { }

  async use(req: any, res: any, next: () => void) {
    let token = req.headers['authorization']

    req.user = null
    req.apiNoyeau = null

    console.log("query",req.query);
    
    if (req.query.userToken) {
      token = req.query.userToken
    }

    console.log(req.headers)
    if (req.headers['noyeau-api-key'] && req.headers['noyeau-api-key'] == environment.apiKeyCode) {
      req.apiNoyeau = true
    }


    console.log("AuthMiddleware", token)
    if (token) {


      await new Promise(resolve => {
        this.httpService.get('https://api.noyeau.io/gateway/user/account/self', {
          headers: {
            authorization: token,
            'content-type': "application/json"
          }
        }).subscribe(res => {
          req.user = res.data
          console.log(req.user.username, req.user.id)
          resolve(true)
        }, err => {
          resolve(true)
        });
      })
    }
    next()
  }
}
