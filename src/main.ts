import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from './services/config.service';


async function bootstrap() {


  console.log("start")


  const app = await NestFactory.create(AppModule, { cors: true });

  const options = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .addApiKey({
      type: 'apiKey', // this should be apiKey
      name: 'Authorization', // this is the name of the key you expect in header
      in: 'header',
    }, 'JWT' // this is the name to show and used in swagger
    )
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  });

  const configService: ConfigService = app.get(ConfigService);
  await app.listen(await configService.getPort()).then((a) => {
    console.log("api start on port : ", configService.thisApi.port)
  });
}
bootstrap();
