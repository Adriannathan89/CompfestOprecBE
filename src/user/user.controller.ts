import { Body, Controller, Post, Get, Req, UseGuards } from "@nestjs/common";

import { RegisterUserDto } from "./dto/register-user.dto";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("user")
@ApiTags("User")
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post("register")
  @ApiOperation({ summary: "Register new user" })
  async register(@Body() payload: RegisterUserDto) {
    return this.userService.register(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get("self")
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Get authenticated user profile" })
  async getSelf(@Req() req) {
    const username = req.user.username;
    return { username };
  }

  @UseGuards(JwtAuthGuard)
  @Get("finalize-status")
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Get finalize status for authenticated student" })
  async getFinalizeStatus(@Req() req) {
    const userId = req.user.userId;
    return this.userService.getFinalizeStatus(userId);
  }
}
