// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DesignValidationModule } from './design-validation/design-validation.module';
import { AIManagementModule } from './ai/ai.module';
import { IECModule } from './iec-db/iec.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // load .env first
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in environment');
        }
        return {
          uri,
          autoIndex: true,
        };
      },
    }),
    DesignValidationModule,
    AIManagementModule,
    IECModule,
  ],
})
export class AppModule {}
