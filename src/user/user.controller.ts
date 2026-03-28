import { Body, Controller, Post, Get, Req, UseGuards } from "@nestjs/common";

import { RegisterUserDto } from "./dto/register-user.dto";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post("register")
  async register(@Body() payload: RegisterUserDto) {
    return this.userService.register(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get("self")
  async getSelf(@Req() req) {
    const username = req.user.username;
    return { username };
  }

  @UseGuards(JwtAuthGuard)
  @Get("finalize-status")
  async getFinalizeStatus(@Req() req) {
    const userId = req.user.userId;
    return this.userService.getFinalizeStatus(userId);
  }
}
