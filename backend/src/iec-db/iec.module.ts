import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IECService } from './iec.service';
import { Conductor, ConductorSchema } from './schemas/conductor.schema';
import { Insulation, InsulationSchema } from './schemas/insulation.schema';
import { Sheath, SheathSchema } from './schemas/sheath.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conductor.name, schema: ConductorSchema },
      { name: Insulation.name, schema: InsulationSchema },
      { name: Sheath.name, schema: SheathSchema },
    ]),
  ],
  providers: [IECService],
  exports: [IECService],
})
export class IECModule {}
