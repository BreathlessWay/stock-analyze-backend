import { BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

import type { PipeTransform, ArgumentMetadata } from '@nestjs/common';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      console.log(metadata);
      return this.schema.parse(value);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Validation failed');
    }
  }
}
