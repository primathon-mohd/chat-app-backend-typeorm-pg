import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignUpDto) {
    console.log('Inside signup controller !! ', dto);
    const response = await this.authService.signup(dto);
    console.log('Inside controller signup response :: ', response);
    return response;
  }

  @Post('signin')
  async signin(@Body() dto: SignInDto) {
    console.log('Inside signup controller !! ', dto);
    const response = await this.authService.signin(dto);
    console.log('Inside controller signin response :: ', response);
    return response;
  }
}
