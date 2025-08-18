// exists.validator.ts
import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { DataSource } from 'typeorm';

@ValidatorConstraint({ name: 'NotIsExists', async: true })
@Injectable()
export class IsNotExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value || value === '') {
      return true; // Skip validation for empty values
    }
    try {
      const [EntityClass, field] = args.constraints;
      const repo = this.dataSource.getRepository(EntityClass);
      const existing = await repo.findOne({ where: { [field]: value } });
      return !!existing;
    } catch (error) {
      console.error('NotIsExists validation error:', error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const [, field] = args.constraints;
    return `${field} it doesn't exists`; // Updated message
  }
}