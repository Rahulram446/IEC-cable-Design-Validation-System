import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConductorDocument = Conductor & Document;

@Schema({ collection: 'conductors' })
export class Conductor {
  @Prop({ required: true })
  csa: number;

  @Prop({ required: true })
  material: string;

  @Prop({ required: true })
  class: string;

  @Prop()
  nominalDiameter: number;

  @Prop()
  strandConfig?: string;
}

export const ConductorSchema = SchemaFactory.createForClass(Conductor);
ConductorSchema.index({ csa: 1, material: 1 });
