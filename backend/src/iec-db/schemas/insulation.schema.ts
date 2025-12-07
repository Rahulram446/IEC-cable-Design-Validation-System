import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InsulationDocument = Insulation & Document;

@Schema({ collection: 'insulations' })
export class Insulation {
  @Prop({ required: true })
  voltageGrade: string;

  @Prop({ required: true })
  insulationMaterial: string;

  @Prop({ required: true })
  csaMin: number;

  @Prop({ required: true })
  csaMax: number;

  @Prop({ required: true })
  nominalTi: number;

  @Prop({ required: true })
  minTiFactor: number;
}

export const InsulationSchema = SchemaFactory.createForClass(Insulation);
InsulationSchema.index({ insulationMaterial: 1, voltageGrade: 1, csaMin: 1, csaMax: 1 });
