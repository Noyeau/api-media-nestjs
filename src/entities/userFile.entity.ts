import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
var fs = require('fs');
const sharp = require('sharp');
const { exec } = require('child_process');

@Entity()
export class UserFile {

    constructor(options=null) {
        if(options){
            Object.assign(this, options)
        }
     }

    async upload(file = null, name = null, zone = null, createFile: boolean = false): Promise<any> {
        return new Promise(async resolve => {
            if (!file || !name) {
                return resolve({ err: "noFile" })
            } else {
                console.log(file.originalname + "=>" + name, zone)
                this.originalName = file.originalname

                this.nameConstructor(file, name)
                this.zone = zone;

                if (createFile) {
                    fs.writeFile('./public/groups/original/' + this.name, Buffer.from(file.buffer), async (fileOk) => {
                        if (fileOk) {
                            console.log(fileOk)
                            resolve({ error: "error file Save" })
                        }

                        resolve(await this.save())
                        console.log('ca a marché')
                    })
                } else {
                    resolve(await this.save())
                }
                if (this.type.includes('image')) {
                    this.transcodeImage()
                } else if (this.type.includes('video')) {
                    this.transcodeVideo()
                }

            }
        })

    }

    // private nameTmp: string;
    // private needTranscode: string;

    private nameConstructor(originalFile, name) {
        this.type = originalFile.mimetype;
        if (originalFile.mimetype === 'image/jpeg') {
            this.name = name + '.jpg';
            // this.nameTmp = this.name;
        }
        else if (originalFile.mimetype === 'image/png') {
            this.name = name + '.png';
            // this.nameTmp = this.name;
        }
        else if (originalFile.mimetype === 'image/gif') {
            this.name = name + '.gif';
            // this.nameTmp = this.name;
        }
        else if (originalFile.mimetype === 'image/tiff') {
            this.name = name + '.tiff';
            // this.nameTmp = this.name;
        }
        else if (originalFile.mimetype === 'video/mpeg') {
            this.name = name + '.mpg';
            // this.nameTmp = this.name;
        }
        else if (originalFile.mimetype === 'video/mp4') {
            this.name = name + '.mp4';
            // this.nameTmp = this.name;
        }
        else if (originalFile.mimetype === 'video/quicktime') {
            this.name = name + '.mov';
            // this.nameTmp = this.name;
        }
        else if (originalFile.mimetype === 'video/x-flv') {
            this.name = name + '.flv';
            // this.nameTmp = this.name;
        }
        else if (originalFile.mimetype === 'audio/amr') {
            let nam = name
            this.name = nam + '.mp3';
            // this.nameTmp = nam + '.amr';
            // this.needTranscode = 'amr';
            // this.mimetype = "audio/mp3"
        }
        else if (originalFile.mimetype === 'audio/mp3') {
            this.name = name + '.mp3';
            // this.nameTmp = this.name;
        }
        else if (originalFile.mimetype === 'audio/wav') {
            this.name = name + '.wav';
            // this.nameTmp = this.name;
        }
        else if (originalFile.mimetype === 'audio/ogg') {
            this.name = name + '.ogg';
            // this.nameTmp = this.name;
        }
        else if (originalFile.mimetype === 'audio/ac3') {
            this.name = name + '.ac3';
            // this.nameTmp = this.name;
        }
        else if (originalFile.mimetype === 'audio/m4a') {
            this.name = name + '.m4a';
            // this.nameTmp = this.name;
        }
        else if (originalFile.mimetype === 'application/pdf') {
            this.name = name + '.pdf';
            // this.nameTmp = this.name;
        }
        else {
            this.name = 'error'
        }


        this.size = originalFile.size;
        this.urlFull = "/mediaFull/" + this.name;

        if (originalFile.mimetype.includes("image")) {
            this.url = "/media600/" + this.name;
            this.urlMini = "/media300/" + this.name;
            this.urlBig = "/media1200/" + this.name;
        }

        if (originalFile.mimetype.includes("video")) {
            let tmp = this.name.split('.')[0]
            this.url = "/video/" + tmp + ".mp4"; //fichier transcodé
            this.urlMini = "/media300/" + tmp + ".jpg"; //image de la video
        }

    }

    getPath(full = false) {
        if (full) {
            return './public/groups/original/' + this.name
        }
        return './public/groups/300/' + this.name
    }

    transcodeImage() {
        sharp('./public/groups/original/' + this.name)
            .resize(1200)
            .toFile('./public/groups/1200/' + this.name, (err, info) => {
                if (err) console.log('thumb1200 error', err);
                else console.log('thumb1200 complete');
            })
            .resize(600)
            .toFile('./public/groups/600/' + this.name, (err, info) => {
                if (err) console.log('thumb600 error', err);
                else console.log('thumb600 complete');
            })
            .resize(300)
            .toFile('./public/groups/300/' + this.name, (err, info) => {
                if (err) console.log('thumb300 error', err);
                else console.log('thumb300 complete');
            });
    }

    transcodeVideo() {

        let nameTmp = this.name.split('.')[0]

        exec('ffmpeg -i "./public/groups/original/' + this.name + '" -vf scale="320:-2" "./public/groups/videoMini/' + nameTmp + '.mp4"', (err, stdout, stderr) => {
            if (err) {
                console.log(err)

                // node couldn't execute the command
                return;
            }
            //On cré une Frame
            exec('ffmpeg -i "./public/groups/original/' + this.name + '" -ss 00:00:01 -vframes 1 "./public/groups/300/' + nameTmp + '.jpg"', (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                    console.log('ffmpeg -i "./public/groups/original/' + this.name + '" -ss 00:00:10 -vframes 1 "./public/groups/300/' + nameTmp + '.jpg"');

                    // node couldn't execute the command
                    return;
                }


                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
            });
            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });
    }




    public async save() {
        // let service: FileService = new FileService();
        // return await service.save(this)
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    originalName: string;

    @Column({ nullable: true })
    size: number;

    @Column()
    type: string;

    @Column()
    path: string;

    @Column({ default: false })
    public: boolean;

    @Column({ default: false })
    private: boolean;

    @Column({ default: "file" })
    zone: string;

    @Column({ nullable: true })
    url: string;

    @Column({ nullable: true })
    urlBig: string;

    @Column({ nullable: true })
    urlFull: string;

    @Column({ nullable: true })
    urlMini: string;


    @Column()
    userId: string;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    lastModifiedDate: Date;

}