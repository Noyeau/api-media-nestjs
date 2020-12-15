import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFile } from 'src/entities/userFile.entity';
import { Repository } from 'typeorm';
import { TranscodeService } from './transcode.service';
import { TokenService } from './token.service';
import { ProfileService } from './profile.service';
const fs = require('fs');




@Injectable()
export class FilesService {

    pathOriginal: string = "public/users-files/original-medias/"

    pathDefaultGeneralFolder="public/users-files/"


    constructor(
        @InjectRepository(UserFile) private fileRepository: Repository<UserFile>,
        private transcodeService: TranscodeService,
        private profileService: ProfileService,
    ) { }




    private async filesNameList() {
        return new Promise(async (resolve) => {
            let list: string[] = [];
            this.getAll().then(fileList => {
                fileList.map(elem => {
                    list.push(elem.name)
                })
                resolve(list)
            }, () => {
                resolve([])
            })
        })
    }


    public getAll(): Promise<UserFile[]> {
        return this.fileRepository.find()
    }

    public getAllOfUserId(userId: number): Promise<UserFile[]> {
        return this.fileRepository.find({ where: { userId } })
    }

    public async getOne(fileId, withToken = false): Promise<UserFile> {
        return this.fileRepository.findOne(fileId)
    }



    // public async addOne(file, name, zone, context: any): Promise<UserFile[]> {
    //     return new Promise<UserFile[]>((resolve, reject) => {
    //         let newFile = new UserFile()
    //         newFile.userId = context.request['user'].id
    //         resolve(newFile.upload(file, name, zone))
    //     })
    // }

    public async genereName(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let name = '_' + Math.random().toString(36).substr(2, 10);
            this.filesNameList().then(async (nameList: string[]) => {
                if (nameList.includes(name)) {
                    resolve(await this.genereName())
                } else {
                    console.log(name)
                    resolve(name)
                }
            }, err => {
                reject(err)
            })
        })
    }

    public async save(file): Promise<UserFile> {
        return new Promise<UserFile>((resolve, reject) => {
            this.fileRepository.save(file).then(newFile => {
                console.log("newFile", newFile)
                this.fileRepository.findOne(newFile.id).then((res) => {
                    console.log("res", res)
                    resolve(res);
                })
            });
        })
    }




    async getUserSpace(userId) {
        let files = await this.getAllOfUserId(userId)
        let size = 0
        files.map(file => {
            size += +file.size
        })


        let total = +(await this.profileService.getProfile(userId)).totalSpace * 1024*1024*1024

        return {
            use:size,
            total:total,
            free: total - size
        }
    }




    getPath(userFile: UserFile, fileSize: string = "sd", extention = true): string {

        let path = userFile.path
        let ext = ''

        switch (fileSize) {
            case "original":
                path += "original-medias/"
                break;

            case "hd":
                path += "hd-medias/"
                break;

            case "sd":
                path += "sd-medias/"
                break;

            case "thum":
                path += "thum-medias/"
                break;

            default:
                fileSize = 'thum'
                path += "thum-medias/"
                break;
        }

       if(extention){
        if (userFile.type.includes('video')) {
            if (fileSize == 'thum') {
                ext = ".jpg"
            } else if (fileSize == 'sd' || fileSize == 'hd') {
                ext = ".mp4"
            } 
        }
        if(ext == '') {
            ext = this.getExtension(userFile.originalName);
        }
       }
     

        path += userFile.name + ext


        return path

    }





    async saveNewFile(userId, file) {
        let name = await this.genereName()
        let pathFile: string = await new Promise(resolve => {
            let path = this.pathDefaultGeneralFolder+"/original-medias/"+ name + this.getExtension(file.originalname)
            fs.writeFile(path, Buffer.from(file.buffer), async (err) => {
                if (err) {
                    console.log(err)
                    resolve(null)
                }

                resolve(path)
                console.log('ca a marché')
            })
        })
        if (!pathFile) {
            return null
        }

        let userFile = await this.fileRepository.save({
            userId,
            name: name,
            originalName: file.originalname,
            size: file.size,
            path: this.pathDefaultGeneralFolder,
            type: file.mimetype
        })

        setTimeout(()=>{
            this.initialTranscodeUserFile(userFile)
        },100)
        return userFile
    }

    async initialTranscodeUserFile(userFile: UserFile) {
        if (userFile.type.includes('image')) {
            await this.transcodeService.resizeImage(this.getPath(userFile, "original"), this.getPath(userFile, "thum"), 150)
            await this.transcodeService.resizeImage(this.getPath(userFile, "original"), this.getPath(userFile, "sd"), 600)
            await this.transcodeService.resizeImage(this.getPath(userFile, "original"), this.getPath(userFile, "hd"), 1200)   

        } else if (userFile.type.includes('video')) {
            await this.transcodeService.videoThum(this.getPath(userFile, "original"), this.getPath(userFile, "thum", false), 150)
            await this.transcodeService.transcodeVideo(this.getPath(userFile, "original"), this.getPath(userFile, "hd", false), 720, this.getPath(userFile))
            await this.transcodeService.transcodeVideo(this.getPath(userFile, "hd"), this.getPath(userFile, "sd", false), 360, this.getPath(userFile))
        }
        await this.fileRepository.save(userFile)
    }



    private getExtension(originalName: string) {
        return '.' + originalName.split('.')[originalName.split('.').length - 1]
    }

}
