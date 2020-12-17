import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from 'src/services/profile.service';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { FilesService } from 'src/services/files.service';
import { User } from 'src/decorators/user.decorator';
import { Profile } from 'src/entities/profile.entity';
import { IsUserGuard } from 'src/guards/is-user.guard';

@UseGuards(IsUserGuard)
@ApiSecurity('JWT')
@Controller('profile')
@ApiTags('profile')
export class ProfileController {

    constructor(
        private profileService: ProfileService,
        private filesServices: FilesService
    ) {

    }

    @Get()
    async getProfile(@User() user) {
        let profile: Profile = null
        if (user && user.id) {
            profile = await this.profileService.getProfile(user.id)
            profile['space'] = await this.filesServices.getUserSpace(user.id)
        }
        return profile

    }

    @Get("space")
    async getProfileSpace(@User() user) {
           return this.filesServices.getUserSpace(user.id)
    }







}
