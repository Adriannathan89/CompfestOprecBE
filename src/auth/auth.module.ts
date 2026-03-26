import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "src/guard/jwt-strategy.guard";
import { DrizzleModule } from "src/db/db.module";
import { AuthController } from "./auth.controller";
import { AuthValidationService } from "./auth-validation.service";

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET?.trim();

    if (!secret) {
        throw new Error("JWT_SECRET is not set");
    }

    return secret;
};

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            useFactory: async () => ({
                secret: getJwtSecret(),
                signOptions: { expiresIn: '15m' },
            }),
        }),
        DrizzleModule,
    ],
    providers: [AuthService, AuthValidationService, JwtStrategy],
    controllers: [AuthController],
    
}) export class AuthModule {}