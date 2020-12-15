import { Injectable } from '@nestjs/common';
const fs = require('fs');
const resizeImg = require('resize-img');
const ffmpeg = require('ffmpeg');

@Injectable()
export class TranscodeService {





    resizeImage(originalPath, destinationPath, size: number): Promise<string> {
        return new Promise(async resolve => {
            // ffmpeg -i input.jpg -vf scale=320:240 output_320x240.png
            try {

                const image = await resizeImg(fs.readFileSync(originalPath), {
                    width: size
                });

                fs.writeFileSync(destinationPath, image);
                resolve(destinationPath + ".jpg")

                // var process = new ffmpeg(originalPath);
                // process.then(function (video) {
                //     console.log(video.metadata)
                //     if (video.metadata.video.rotate == 90) {
                //         if (video.metadata.video.resolution.w < size) {
                //             size = video.metadata.video.resolution.w
                //         }
                //         video
                //             .addCommand("-vf", "split[original][copy];[copy]scale=ih*16/9:-1,crop=h=iw*9/16,gblur=sigma=20[blurred];[blurred][original]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2")

                //         video
                //             .setVideoSize(size + "x?")
                //     } else {
                //         if (video.metadata.video.resolution.h < size) {
                //             size = video.metadata.video.resolution.h
                //         }
                //         video
                //             .setVideoSize(size + "x?", true, true)
                //     }
                //     video
                //         .save(destinationPath + ".jpg", (error, file) => {
                //             if (error) {
                //                 return resolve(null)
                //             }
                //             console.log('ImageResize complete size->' + size);
                //             resolve(destinationPath + ".jpg")
                //         })
                // }, err => {
                //     resolve(null)
                // })
            } catch (e) {
                console.log(e.code);
                console.log(e.msg);
                resolve(null)
            }


            // sharp(originalPath)
            //     .resize(size)
            //     .toFile(destinationPath, (err, info) => {
            //         if (err) {
            //             console.log('ImageResize error', err);
            //             resolve(null)
            //         }
            //         else {
            //             console.log('ImageResize complete size->' + size);
            //             resolve(destinationPath)
            //         }
            //     })
        })
    }


    videoThum(videoPath, thumPath, size: number = 150): Promise<string> {
        return new Promise((resolve) => {
            try {
                var process = new ffmpeg(videoPath);
                process.then(function (video) {

                    if (video.metadata.video.rotate == 90) {
                        if (video.metadata.video.resolution.w < size) {
                            size = video.metadata.video.resolution.w
                        }
                        video
                            .addCommand("-vf", "split[original][copy];[copy]scale=ih*16/9:-1,crop=h=iw*9/16,gblur=sigma=20[blurred];[blurred][original]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2")

                        video
                            .setVideoSize(size + "x?")
                    } else {
                        if (video.metadata.video.resolution.h < size) {
                            size = video.metadata.video.resolution.h
                        }
                        video
                            .setVideoSize(size + "x?", true, true)
                    }

                    video
                        .addCommand("-ss", "00:00:01")
                    video
                        .addCommand("-vframes", '1')
                    video
                        .save(thumPath + ".jpg", (error, file) => {
                            if (error) {
                                return resolve(null)
                            }
                            resolve(thumPath + ".jpg")
                        })
                }, err => {
                    resolve(null)
                })
            } catch (e) {
                console.log(e.code);
                console.log(e.msg);
                resolve(null)
            }
        });

    }

    transcodeVideo(originalPath, destinationPath, size: number = 360, thumPath = null): Promise<string> {


        console.log('-------------------Transcode -> '+ originalPath +' -Size- '+size);

        return new Promise((resolve) => {
            try {
                var process = new ffmpeg(originalPath);
                process.then((video) => {




                    if (video.metadata.video.rotate == 90) {
                        if (video.metadata.video.resolution.w < size) {
                            size = video.metadata.video.resolution.w
                        }
                        video
                            .addCommand("-vf", "split[original][copy];[copy]scale=ih*16/9:-1,crop=h=iw*9/16,gblur=sigma=20[blurred];[blurred][original]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2")
                        video
                            .setVideoSize('?x' + size)
                        video
                            .save(destinationPath + '.mp4', (error, file) => {
                                if (error) {
                                    console.log(error)
                                    return resolve(null)
                                }
                                console.log('Video file: ' + file);
                                resolve(destinationPath + '.mp4')
                            });
                    }
                    else {

                        if (video.metadata.video.resolution.h < size) {
                            size = video.metadata.video.resolution.h
                        }

                        video
                            .setVideoSize('?x' + size, true, true)
                            .setVideoCodec('h264')
                        video
                            .save(destinationPath + '.mp4', (error, file) => {
                                if (error) {
                                    console.log(error)
                                    return resolve(null)
                                }
                                console.log('Video file: ' + file);
                                resolve(destinationPath + '.mp4')
                            });

                    }


                }, (err) => {
                    console.log('-------------------Plantage 1111');

                    console.log('Error: ' + err);
                    resolve(null)
                });
            } catch (e) {
                console.log('-------------------Plantage 2222');

                console.log(e.code);
                console.log(e.msg);
                resolve(null)
            }
        })
    }

}
