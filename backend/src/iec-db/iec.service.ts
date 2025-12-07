import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conductor, ConductorDocument } from './schemas/conductor.schema';
import { Insulation, InsulationDocument } from './schemas/insulation.schema';
import { Sheath, SheathDocument } from './schemas/sheath.schema';

@Injectable()
export class IECService {
  private readonly logger = new Logger(IECService.name);

  constructor(
    @InjectModel(Conductor.name) private conductorModel: Model<ConductorDocument>,
    @InjectModel(Insulation.name) private insulationModel: Model<InsulationDocument>,
    @InjectModel(Sheath.name) private sheathModel: Model<SheathDocument>,
  ) {}

  async getConductor(data: { csa?: number; conductor_material?: string }): Promise<any | null> {
    if (!data?.csa || !data?.conductor_material) return null;

    const exact = await this.conductorModel.findOne({ csa: data.csa, material: data.conductor_material }).lean().exec();
    if (exact) return exact;

    const docs = await this.conductorModel.find({ material: data.conductor_material }).sort({ csa: 1 }).lean().exec();
    if (!docs || docs.length === 0) return null;

    const arr = Array.isArray(docs) ? docs : [docs];
    let closest = arr[0];
    let minDiff = Math.abs((closest.csa ?? 0) - data.csa);
    for (const d of arr) {
      const diff = Math.abs((d.csa ?? 0) - data.csa);
      if (diff < minDiff) {
        minDiff = diff;
        closest = d;
      }
    }
    return closest;
  }

  async getInsulation(data: { csa?: number; insulation_material?: string; voltage?: string }): Promise<any | null> {
    if (!data?.csa || !data?.insulation_material) return null;

    const doc = await this.insulationModel.findOne({
      insulationMaterial: data.insulation_material,
      csaMin: { $lte: data.csa },
      csaMax: { $gte: data.csa },
      ...(data.voltage ? { voltageGrade: data.voltage } : {})
    }).lean().exec();

    return doc ?? null;
  }

  async getSheathRules(): Promise<any | null> {
    const doc = await this.sheathModel.findOne({}).sort({ _id: 1 }).lean().exec();
    return doc ?? null;
  }

  async findBestMatches(data: any) {
    const [conductor, insulation] = await Promise.all([
      this.getConductor(data),
      this.getInsulation(data),
    ]);
    return { conductor, insulation };
  }
}
