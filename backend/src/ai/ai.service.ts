import { Injectable } from '@nestjs/common';

@Injectable()
export class AIService {
  // Temporary stub. Replace with LLM call later.
  async extractFields(text: string) {
    return {
      standard: "IEC 60502-1",
      voltage: "0.6/1 kV",
      conductor_material: "Cu",
      conductor_class: "Class 2",
      csa: 10,
      insulation_material: "PVC",
      insulation_thickness: 1.0
    };
  }
}
