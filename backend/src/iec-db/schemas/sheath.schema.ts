import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SheathDocument = Sheath & Document;

@Schema({ collection: 'sheaths' })
export class Sheath {
  @Prop()
  formulaCoef: number;

  @Prop()
  minThickness: number;

  @Prop()
  maxThickness: number;

  @Prop({ type: Object, default: {} })
  meta?: Record<string, any>;
}

export const SheathSchema = SchemaFactory.createForClass(Sheath);
SheathSchema.index({ minThickness: 1, maxThickness: 1 });
