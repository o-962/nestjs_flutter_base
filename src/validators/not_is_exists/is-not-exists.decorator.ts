// exists.decorator.ts
import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsNotExistsValidator } from './is-not-exists.validator';


export function IsNotExists(
  entity: Function, 
  field: string, 
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [entity, field],
      validator: IsNotExistsValidator,
    });
  };
}