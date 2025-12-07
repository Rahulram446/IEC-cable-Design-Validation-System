import { Controller, Post, Body } from '@nestjs/common';
import { DesignValidationService } from './design-validation.service';

@Controller("design")
export class DesignValidationController {
  constructor(private readonly service: DesignValidationService) {}

  @Post("validate")
  async validate(@Body() input: any) {
    return this.service.validate(input);
  }
}
