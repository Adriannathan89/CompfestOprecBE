import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';


export type JwtPayload = {
    userId: string
    username: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: String(process.env.JWT_SECRET),
        });
    }

    async validate(payload: JwtPayload) {
        const jwtPayload: JwtPayload = {
            userId: payload.userId,
            username: payload.username,
        };

        return jwtPayload;
    }
}