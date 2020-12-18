import { Module, HttpModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './services/files.service';
import { FilesController } from './controllers/files.controller';
import { MediaService } from './services/media.service';
import { UserFile } from './entities/userFile.entity';
import { MediaController } from './controllers/media.controller';
import { ProfileService } from './services/profile.service';
import { Profile } from './entities/profile.entity';
import { ProfileController } from './controllers/profile.controller';
import { AuthMiddleware } from './auth.middleware';
import { TranscodeService } from './services/transcode.service';
import { TokenService } from './services/token.service';
import { ConfigService } from './services/config.service';
import { environment } from './environment/environment';



@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forRoot(environment.bddConfig),
    TypeOrmModule.forFeature([UserFile, Profile])

  ],
  controllers: [
    AppController,
    FilesController,
    MediaController,
    ProfileController,
  ],
  providers: [
    AppService,
    FilesService,
    MediaService,
    ProfileService,
    TranscodeService,
    TokenService,
    ConfigService,
  ]
})
export class AppModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
