import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from 'src/auth/guard';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
// @UseGuards(JwtGuard)
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('info/:id')
  async retrieve(@Req() req: Request, @Param('id') id: number) {
    console.log(req.user, req.user['email']);
    const response = await this.userService.retrieve(req.user['email'], id);
    return response;
  }
}
