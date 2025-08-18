// exists.decorator.ts
import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsExistsValidator } from './is-exists.validator';


export function IsExists(
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
      validator: IsExistsValidator,
    });
  };
}