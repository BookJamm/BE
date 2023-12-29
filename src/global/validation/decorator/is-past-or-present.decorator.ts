import { ValidationOptions, registerDecorator } from 'class-validator';

export function IsPastOrPresent(options?: ValidationOptions) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      name: 'IsPastOrPresent',
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: {
        validate(value: any) {
          const now = Date.now();
          const requestDate = new Date(value).getTime();

          return now - requestDate >= 0;
        },
      },
    });
  };
}
