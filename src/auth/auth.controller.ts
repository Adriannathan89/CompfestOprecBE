import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { AuthValidationService } from "./auth-validation.service";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RefreshTokenDto } from "./dto/refresh-token.dto";


@Controller('auth')
@ApiTags("Auth")
export class AuthController {
    constructor(
        private authService: AuthService,
        private authValidationService: AuthValidationService
    ) {}

    @Post('login')
    @ApiOperation({ summary: "Login user and issue access + refresh tokens" })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @ApiOperation({ summary: "Refresh access token using refresh token" })
    async refreshToken(@Body() payload: RefreshTokenDto) {
        const { refreshToken } = payload;
        return this.authService.refreshToken(refreshToken);
    }

    @Post('logout')
    @ApiOperation({ summary: "Logout and invalidate refresh token" })
    async logout(@Body() payload: RefreshTokenDto) {
        const { refreshToken } = payload;
        return this.authService.logout(refreshToken);
    }

    @UseGuards(JwtAuthGuard) 
    @Post('validate')
    @ApiBearerAuth("access-token")
    @ApiOperation({ summary: "Validate role for authenticated user" })
    async validateRole(@Req() req) {
        const userId = req.user.userId;
        return this.authValidationService.validateRole(userId);
    }
}