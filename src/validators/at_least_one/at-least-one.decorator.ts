
import { registerDecorator, ValidationOptions } from 'class-validator';
import { AtLeastOneValidator } from './at-least-one.validator';

export function AtLeastOne( properties :string[] , validationOptions?: ValidationOptions, ) {
  return function (object: Object, propertyName: string) {
    
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [properties],
      validator: AtLeastOneValidator,
    });
  };
}