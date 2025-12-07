import { Injectable } from "@nestjs/common";
import { AIService } from "../ai/ai.service";
import { IECService } from "../iec-db/iec.service";
import { applyConductorRule } from "./rules/conductor.rule";
import { applyInsulationRule } from "./rules/insulation.rule";
import { applySheathRule } from "./rules/sheath.rule";

@Injectable()
export class DesignValidationService {
  constructor(
    private readonly ai: AIService,
    private readonly iec: IECService
  ) {}

  async validate(input: any) {
    let extracted = {};

    if (input.free_text) {
      extracted = await this.ai.extractFields(input.free_text);
    }

    const data = { ...extracted, ...input };

    const conductor = await this.iec.getConductor(data);
    const insulation = await this.iec.getInsulation(data);
    const sheath = await this.iec.getSheathRules();

    return {
      extracted,
      results: [
        applyConductorRule(data, conductor),
        applyInsulationRule(data, insulation),
        applySheathRule(data, sheath),
      ],
    };
  }
}
