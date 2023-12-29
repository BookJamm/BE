import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { AuthResponseCode } from 'src/auth/exception/auth-respone-code';
import { BaseException } from 'src/global/base/base-exception';

@Injectable()
export class AuthRequestValidationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (value) {
      return value;
    } else {
      throw BaseException.of(AuthResponseCode.EMPTY_TOKEN);
    }
  }
}
