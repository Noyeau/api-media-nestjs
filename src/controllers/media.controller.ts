import { Controller, Get, Req, Res, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FilesService } from 'src/services/files.service';
import { User } from 'src/decorators/user.decorator';
import { TokenService } from 'src/services/token.service';
import { ApiNoyeau } from 'src/decorators/apiNoyeau.decorator';
const fs = require('fs');
const _path = require('path');

@Controller('media')
@ApiTags('media')
export class MediaController {


    constructor(private filesService: FilesService, private tokenService: TokenService) {

    }

    @Get('user-avatar/:userId')
    async getUserAvatar(@Req() req, @Res() res, @Param("userId") userId: number, @Query("size") size: string = "thum") {
        let path = "public/api-files/private_image.jpg"
        let type = "image/jpeg"
        let userFile = await this.filesService.getUserAvatarFile(userId)
        if (userFile) {
            path = this.filesService.getPath(userFile, size)

        }
        sendImage()
        return
        function sendImage() {
            fs.readFile(path, (err, content) => {
                if (err) {
                    path = "public/api-files/offline.jpg"
                    sendImage()
                } else {
                    //specify the content type in the response will be an image
                    res.writeHead(200, { 'Content-type': type });
                    res.end(content);
                }
            });
        }

    }

    /**
     * Permet de lire un fichier directement
     * @param fileId Id du fichier à lire
     */
    @Get(':fileId')
    async getMediaStream(@Req() req, @Res() res, @Param("fileId") fileId:number, @Query("token") token=null, @Query("size") size:string = "sd", @User() user, @ApiNoyeau() apiNoyeau, @Query("force") force=null) {
        console.log(fileId, size)
        let path = "public/api-files/private_image.jpg"
        let type = "image/jpeg"

        let userFile = await this.filesService.getOne(fileId)


        if (userFile) {


            if (apiNoyeau && force) {
                path = this.filesService.getPath(userFile, size)
                type = userFile.type
            }
            else if (userFile.public) {
                //Si public on affiche tjr le media
                path = this.filesService.getPath(userFile, size)
                type = userFile.type
            }
            else if (user && user.id && user.id == userFile.userId) {
                //Sinon on affiche uniquement si l'user est propriétaire
                path = this.filesService.getPath(userFile, size)
                type = userFile.type
            }
            else if (token && user && this.tokenService.verifyToken(token, user.id, fileId) && !userFile.private) {
                //avec token d'authorisation d'une autre API on peut regarder si le userFile n'est pas PRIVATE
                path = this.filesService.getPath(userFile, size)
                type = userFile.type
            }


            if (size == "thum") {
                type = "image/jpeg"
            }
            console.log(path)






        } else {
            path = "public/api-files/offline.jpg"
        }


        if (type.includes('image') || size == 'thum') {
            console.log(path, size)
            sendImage()
        } else if (type.includes('video')) {
            sendVideo()
        }



        function sendImage() {
            fs.readFile(path, (err, content) => {
                if (err) {
                    path = "public/api-files/offline.jpg"
                    sendImage()
                } else {
                    //specify the content type in the response will be an image
                    res.writeHead(200, { 'Content-type': type });
                    res.end(content);
                }
            });
        }

        function sendVideo() {

            if (!fs.existsSync(path)) {
                console.log('The path no-exists.');

                return res.status(404).send()
            }

            const stat = fs.statSync(path)
            const fileSize = stat.size
            const range = req.headers.range
            if (range) {
                const parts = range.replace(/bytes=/, "").split("-")
                const start = parseInt(parts[0], 10)
                const end = parts[1]
                    ? parseInt(parts[1], 10)
                    : fileSize - 1
                const chunksize = (end - start) + 1
                const file = fs.createReadStream(path, { start, end })
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': type,
                }
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': type,
                }
                res.writeHead(200, head)
                fs.createReadStream(path).pipe(res)
            }
        }


    }

    @Get(':fileId/download')
    async getMediaDownload(@Req() req, @Res() res, @Param("fileId") fileId:number, @Query("token") token:string, @Query("size") size:string = "sd", @User() user) {
        console.log(fileId, size)
        let path = null

        let userFile = await this.filesService.getOne(fileId)


        if (userFile) {

            if (userFile.public) {
                //Si public on affiche tjr le media
                path = this.filesService.getPath(userFile, size)
            }
            else if (user && user.id && user.id == userFile.userId) {
                //Sinon on affiche uniquement si l'user est propriétaire
                path = this.filesService.getPath(userFile, size)
            }
            else if (token && user && user.id && this.tokenService.verifyToken(token, user.id, fileId) && !userFile.private) {
                //avec token d'authorisation d'une autre API on peut regarder si le userFile n'est pas PRIVATE
                path = this.filesService.getPath(userFile, size)
            }

        } else {
            path = null
        }

        if (path) {
            path = _path.normalize(path)
            console.log("path")
            console.log(path)
            res.download(path);
        } else {
            res.status(403).send()
        }
    }

}



