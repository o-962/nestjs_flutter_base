import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import { validationErrorResponse } from '@utils/response';
import { TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';

// Create a ValidationPipe instance with the same options as your global pipe
const testValidationPipe = new ValidationPipe({
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  transform: true,
  exceptionFactory: (errors: ValidationError[]) => {
    const errorsObject = errors.reduce((acc, err) => {
      const messages = Object.values(err.constraints || {});
      acc[err.property] = messages;
      return acc;
    }, {} as Record<string, string[]>);

    throw validationErrorResponse({ errors: errorsObject });
  },
});

async function validateDtoManually(
  dtoClass: any, 
  plainObject: any, 
  module: TestingModule // Make this required since we need it for DI
) {
  // Configure class-validator to use the NestJS container
  useContainer(module, { fallbackOnErrors: true });

  // Transform plain object into class instance
  const object = plainToInstance(dtoClass, plainObject);

  // Validate the instance
  const errors = await validate(object);

  if (errors.length > 0) {
    // Build error messages just like your pipe does
    const errorsObject = errors.reduce((acc, err) => {
      const messages = Object.values(err.constraints || {});
      acc[err.property] = messages;
      return acc;
    }, {} as Record<string, string[]>);

    // Throw your custom validation error response
    throw validationErrorResponse({ errors: errorsObject });
  }

  return object; // validated DTO
}

export {
  testValidationPipe,
  validateDtoManually
};