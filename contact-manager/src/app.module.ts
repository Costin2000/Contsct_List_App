import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactController } from './contact/contact.controller';
import { ContactService } from './contact/contact.service';
import { ContactRepository } from './contact/repositories/contact.repository';
import { TelephoneRepository } from './contact/repositories/telephone.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'root',
        database: 'MySQL80',
        entities: [`${__dirname}**/contact/models/*.models.{js,ts}`],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([ContactRepository]),
    TypeOrmModule.forFeature([TelephoneRepository]),
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class AppModule {}
