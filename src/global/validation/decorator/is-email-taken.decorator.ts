import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { AuthService } from 'src/auth/auth.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailTakenConstraint implements ValidatorConstraintInterface {
  constructor(private readonly authService: AuthService) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
    return !this.authService.checkEmailTaken(value);
  }
}

export function IsEmailTaken(options?: ValidationOptions) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsEmailTakenConstraint,
    });
  };
}
