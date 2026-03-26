import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { AuthValidationService } from "./auth-validation.service";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";


@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private authValidationService: AuthValidationService
    ) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    async refreshToken(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @Post('logout')
    async logout(@Body('refreshToken') refreshToken: string) {
        return this.authService.logout(refreshToken);
    }

    @UseGuards(JwtAuthGuard) 
    @Post('validate')
    async validateRole(@Req() req) {
        const userId = req.user.userId;
        return this.authValidationService.validateRole(userId);
    }
}