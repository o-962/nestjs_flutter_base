import { registerDecorator, ValidationOptions } from 'class-validator';
import { AtLeastOneBufferValidator } from './at-least-buffer.validator';

export function AtLeastOneBuffer(
  properties: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [properties],
      validator: AtLeastOneBufferValidator, // pass the class reference here WITHOUT new()
    });
  };
}
