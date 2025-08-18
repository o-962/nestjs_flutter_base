import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'AtLeastOneBuffer', async: false })
export class AtLeastOneBufferValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const object = args.object as any;
    const properties = args.constraints[0] as string[];

    return properties.some((property) => {
      const val = object[property];
      return val instanceof Buffer && val.length > 0;
    });
  }

  defaultMessage(args: ValidationArguments): string {
    return `At least one file must be uploaded.`;
  }
}