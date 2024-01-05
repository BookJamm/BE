import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class PlaceConverter implements OnModuleInit {
  private static staticAuthService: AuthService;
  constructor(private readonly authService: AuthService) {}

  onModuleInit() {
    PlaceConverter.staticAuthService = this.authService;
  }
}
