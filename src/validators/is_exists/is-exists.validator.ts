import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { DataSource } from 'typeorm';

@ValidatorConstraint({ name: 'IsExists', async: true })
@Injectable()
export class IsExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value || value === '') {
      return false;
    }
    
    try {
      const [EntityClass, field] = args.constraints;
      const repo = this.dataSource.getRepository(EntityClass);
      const existing = await repo.findOne({ where: { [field]: value } });
      return !existing; // Return true if NOT exists (validation passes)
    } catch (error) {
      console.error('IsExists validation error:', error);
      return false;
    }
  }

  getDataSource() {
    return this.dataSource;
  }

  defaultMessage(args: ValidationArguments) {
    const [, field] = args.constraints;
    return `${field} already exists`;
  }
}
