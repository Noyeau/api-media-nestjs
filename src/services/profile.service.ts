import { Injectable } from '@nestjs/common';
import { UserFile } from 'src/entities/userFile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from 'src/entities/profile.entity';

@Injectable()
export class ProfileService {

    constructor(
        @InjectRepository(UserFile) private fileRepository: Repository<UserFile>,
        @InjectRepository(Profile) private profileRepository: Repository<Profile>,

    ) { }

    async getProfile(userId){
        let profile = await this.profileRepository.findOne({where:{userId}})
        if(!profile){
            let newProfile = new Profile({userId})
            await this.profileRepository.save(newProfile)
            profile = await this.profileRepository.findOne({where:{userId}})
        }
        return profile
    }

}
