import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from 'src/auth/guard';
import { Request } from 'express';
import { MessageDto } from './dto';
// import { AuthGuard } from '@nestjs/passport';

@Controller('users')
// @UseGuards(AuthGuard('jwt'))
// @UseGuards(JwtGuard)
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('info/:id')
  async retrieve(@Req() req: Request, @Param('id') id: number) {
    console.log('Inside retrieve', req.user, req.user['email']);
    const response = await this.userService.retrieve(req.user['email'], id);
    return response;
  }

  @Get('allUsers')
  async findAllUser() {
    console.log('Inside findAllUser ');
    // const email = req.user['email'];
    return await this.userService.getAllUsers();
  }
  @Get(':username')
  async findUserIdByUserName(
    @Req() req: Request,
    @Param('username') username: string,
  ) {
    // console.log('Inside findUserIdByUserName ', req.user['email']);
    // const email = req.user['email'];
    return await this.userService.findUserIdByUserName(username);
  }

  @Post('create')
  async create(@Req() req: Request, @Body() msgDto: MessageDto) {
    console.log('Inside create ', req.user['email']);
    const email = req.user['email'];
    const response = await this.userService.create(email, msgDto);
    return response;
  }

  @Put('update/:id')
  async update(
    @Req() req: Request,
    @Body() msgDto: MessageDto,
    @Param('id') msgId: number,
  ) {
    console.log('inside update ', req.user['email']);
    const email = req.user['email'];
    const response = await this.userService.update(email, msgDto, msgId);
    return response;
  }

  @Delete('delete/:id')
  async delete(@Req() req: Request, @Param('id') msgId: number) {
    console.log(' inside delete ', req.user['email']);
    const email = req.user['email'];
    const response = await this.userService.delete(email, msgId);
    return response;
  }

  @Delete('deleteAll')
  async deleteAll(@Req() req: Request) {
    console.log('Inside delete all ', req.user['email']);
    const email = req.user['email'];
    const response = await this.userService.deleteAll(email);
    return response;
  }

  @Delete('deleteClear')
  async clearAll(@Req() req: Request) {
    console.log('Inside clear all ', req.user['email']);
    const email = req.user['email'];
    const response = await this.userService.clear(email);
    return response;
  }
}
