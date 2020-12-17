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

// const bddConfig={
//   "type": process.env.dbType,
//   "host": process.env.dbHost,
//   "port": +process.env.dbPort,
//   "username": process.env.dbUsername,
//   "password": process.env.dbPassword,
//   "database": process.env.dbDatabase,
//   "entities": [
//       process.env.dbEntities
//   ],
//   "synchronize": process.env.dbSynchronize == 'true' ? true : false
// }

@Module({
  imports: [
    HttpModule,
    // TypeOrmModule.forRootAsync({
    //   useClass: ConfigService,
    // }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: process.env.dbType as any,
        host: process.env.dbHost,
        port: +process.env.dbPort,
        username: process.env.dbUsername,
        password: process.env.dbPassword,
        database: process.env.dbDatabase,
        entities: [process.env.dbEntities],
        synchronize: process.env.dbSynchronize == 'true' ? true : false
      }),
    }),
    //  TypeOrmModule.forRoot(bddConfig),
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
