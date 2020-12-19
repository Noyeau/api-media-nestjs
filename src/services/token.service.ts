import { Injectable } from '@nestjs/common';
import { UserFile } from 'src/entities/userFile.entity';
import { environment } from 'src/environment/environment';
const jwt = require('jsonwebtoken');

const tokenSecret = environment.tokenSecret
const tokenTime = environment.tokenTime

@Injectable()
export class TokenService {


    verifyToken(token, userId, fileId):Promise<boolean> {
        return new Promise(resolve => {


            jwt.verify(token, tokenSecret, (err, decoded) => {
                if (err) {
                    resolve(false)
                }
                else {
                    resolve((decoded.userId == userId && decoded.fileId == fileId) ? true : false)
                }
            });
        })
    }

    genereToken(userId, fileId):string {
        return jwt.sign({ userId, fileId }, tokenSecret, {
            expiresIn: environment.tokenTime // expires in 5 mins
        });
    }


    addTokenToUserFile(userFiles:UserFile[],userId:number) :UserFile[]{
        return userFiles.map(file=>{
            file['token'] = this.genereToken(userId,file.id)
            return file
        })
    }

}
