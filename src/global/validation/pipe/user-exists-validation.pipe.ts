import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { BaseException } from 'src/global/base/base-exception';
import { UserResponseCode } from 'src/user/exception/user-response-code';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserExistsValidationPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(value: number, metadata: ArgumentMetadata) {
    const isValid = await this.userService.isUserExists(value);
    if (!isValid) {
      throw BaseException.of(UserResponseCode.USER_NOT_FOUND);
    }

    return value;
  }
}
