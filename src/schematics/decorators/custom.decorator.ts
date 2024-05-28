import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsNumberOrNumericString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNumberOrNumericString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, _args: ValidationArguments) {
          // Check if the value is a number or a numeric string
          return (
            typeof value === 'number' ||
            (!isNaN(parseFloat(value)) && isFinite(value))
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a number or a numeric string.`;
        },
      },
    });
  };
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const requestData = ctx.switchToHttp().getRequest();
    const { user } = requestData;
    return user;
  },
);
