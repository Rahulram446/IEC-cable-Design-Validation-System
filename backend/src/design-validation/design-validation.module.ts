import { Module } from '@nestjs/common';
import { DesignValidationController } from './design-validation.controller';
import { DesignValidationService } from './design-validation.service';
import { AIManagementModule } from '../ai/ai.module';
import { IECModule } from '../iec-db/iec.module';

@Module({
  imports: [AIManagementModule, IECModule],
  controllers: [DesignValidationController],
  providers: [DesignValidationService],
})
export class DesignValidationModule {}
