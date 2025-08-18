import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';
import { DataSource } from 'typeorm';

@ValidatorConstraint({ name: 'AtLeastOne', async: false })
@Injectable()
export class AtLeastOneValidator implements ValidatorConstraintInterface {
  constructor(
    private readonly dataSource: DataSource
  ) {}

  async validate(value : any , args: ValidationArguments): Promise<boolean> {
    const object = args.object as any;
    const properties = args.constraints[0] as string[];
    
    return properties.some(property => 
      object[property] !== undefined && 
      object[property] !== null && 
      object[property] !== ''
    );
  }

  defaultMessage(args: ValidationArguments) {
    const [, field] = args.constraints;
    return `${field}`;
  }
}