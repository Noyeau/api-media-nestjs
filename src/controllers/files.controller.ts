import { Controller, Get, Req, Post, UploadedFiles, UseInterceptors, UseGuards, Query, Param, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody, ApiConsumes, ApiBasicAuth, ApiSecurity } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';

import { Request } from 'express';
import { FilesService } from 'src/services/files.service';
import { IsUserGuard } from 'src/guards/is-user.guard';
import { User } from 'src/decorators/user.decorator';
import { TokenService } from 'src/services/token.service';
import { ApiNoyeau } from 'src/decorators/apiNoyeau.decorator';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
const fs = require('fs');

@ApiSecurity('JWT')
@Controller('files')
@ApiTags('UserFiles')
export class FilesController {

    constructor(private filesService: FilesService, private tokenService: TokenService) {

    }

    @UseGuards(IsUserGuard)
    @Get()
    getAll(@User() user): any {
        return this.filesService.getAllOfUserId(user.id);
    }





    @Get("multiples")
    async getMultiples(@Res() res, @User() user, @Query('fileIds') fileIdsOrigine:string, @ApiNoyeau() apiNoyeau) {
        let fileIds:any[] = fileIdsOrigine.split(',')
        console.log('-----------------', fileIds)

        let files :any[] = await Promise.all(fileIds.map(async (fileId) => {
            let file = null

            file = await this.filesService.getOne(+fileId);

            if(!file){
                return null
            }

            //Si nonPublic
            if (!file.public) {
                //Si User enregistré
                if (user && user.id) {
                    //Si Pas Propriétaire du fichier
                    if (user.id != file.userId) {
                        console.log('pas afficher')
                        //Si demandé par une api mais pas fichiers user on genere un token
                        if (apiNoyeau) {
                            file = this.tokenService.addTokenToUserFile([file], user.id)[0]
                        }
                        //Si pas propriétaire et pas demandé par API
                        else {
                            file = null
                        }
                    }
                }
                //Sinon pas d'user
                else {
                    file = null
                }
            }
            return file
        }))


        if (files && files.length) {
            files = files.filter((fl: any) => fl)
            return res.status(200).send(files)
        }
        return res.status(HttpStatus.UNAUTHORIZED).send({
            "statusCode": 403,
            "message": "Forbidden resource",
            "error": "Forbidden"
        })





    }



    @Get('self')
    getSelf(@Req() request: Request): any {
        console.log("---------request")
        return request['user']
    }

    @UseGuards(IsUserGuard)
    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                }
            },
        },
    })
    @UseInterceptors(AnyFilesInterceptor())
    uploadFile(@UploadedFiles() files, @User() user) {
        console.log('user-File=>' + user.id, files);
        return Promise.all(files.map(async file => {
            let userSpace= await this.filesService.getUserSpace(user.id)
            let rep = null
            if(userSpace.free >0 && userSpace.free >= file.size){
                rep = await this.filesService.saveNewFile(user.id, file)
            }
            return rep
        })
        )
    }


    @Get(":fileId")
    async getOne(@Res() res, @User() user, @Param('fileId') fileId:number, @ApiNoyeau() apiNoyeau) {

        console.log("getOneFile=>"+fileId)
        let file;

        file = await this.filesService.getOne(fileId);


        if(!file){
            return null
        }

        //Si nonPublic
        if (!file.public) {
            //Si User enregistré
            if (user && user.id) {
                //Si Pas Propriétaire du fichier
                if (user.id != file.userId) {
                    console.log('pas afficher')
                    //Si demandé par une api mais pas fichiers user on genere un token
                    if (apiNoyeau) {
                        file = this.tokenService.addTokenToUserFile([file], user.id)[0]
                    }
                    //Si pas propriétaire et pas demandé par API
                    else {
                        file = null
                    }
                }
            }
            //Sinon pas d'user
            else {
                file = null
            }
        }

        if (file) {
            return res.status(200).send(file)
        }
        return res.status(HttpStatus.UNAUTHORIZED).send({
            "statusCode": 403,
            "message": "Forbidden resource",
            "error": "Forbidden"
        })

    }


    @Get(":fileId/base64")
    async getOneBase64(@Res() res, @User() user, @Param('fileId') fileId:number, @ApiNoyeau() apiNoyeau, @Query('force') force:string=null, @Query('size') size:string="thum") {

        console.log("getOneFileBase64=>"+fileId, apiNoyeau)
        let file;

        file = await this.filesService.getOne(fileId);


        if(!file){
            return null
        }

        if(apiNoyeau && force){
            console.log("forceOK")
            file['base64']=this.filesService.getFileBase64(file, size)
        }
        //Si nonPublic
        else if (!file.public) {
            //Si User enregistré
            if (user && user.id) {
                //Si Pas Propriétaire du fichier
                if (user.id != file.userId) {
                    console.log('pas afficher')
                    //Si demandé par une api mais pas fichiers user on genere un token
                    if (apiNoyeau) {
                        file['base64']=this.filesService.getFileBase64(file, size)
                    }
                    //Si pas propriétaire et pas demandé par API
                    else {
                        file = null
                    }
                }
            }
            //Sinon pas d'user
            else {
                file = null
            }
        }

        if (file) {
            return res.status(200).send(file)
        }
        return res.status(HttpStatus.UNAUTHORIZED).send({
            "statusCode": 403,
            "message": "Forbidden resource",
            "error": "Forbidden"
        })

    }

}
