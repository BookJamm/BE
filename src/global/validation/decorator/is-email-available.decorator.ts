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
export class IsEmailAvailableConstraint implements ValidatorConstraintInterface {
  constructor(private readonly authService: AuthService) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(value: any, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.authService.isEmailAvailable(value);
  }
}

export function IsEmailAvailable(options?: ValidationOptions) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsEmailAvailableConstraint,
    });
  };
}
