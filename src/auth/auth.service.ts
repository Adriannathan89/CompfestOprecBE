import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { Users } from "src/db/schema";
import { eq } from "drizzle-orm";
import { DatabaseResponse } from "src/db/response/db.response";
import * as bcrypt from "bcrypt";
import { JwtPayload } from "src/guard/jwt-strategy.guard";
import { Session } from "src/db/schema/session.schema";
import { BadRequestResponse } from "src/db/response/bad-req.response";

@Injectable()
export class AuthService {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB,
        private readonly jwt: JwtService,
    ) {}

    async login(req: LoginDto) {
        const user = await this.db
            .select()
            .from(Users)
            .where(eq(Users.username, req.username))
            .limit(1)

        if (!user || user.length === 0) {
            throw new BadRequestResponse("Invalid username or password");
        }

        const isPasswordValid = await bcrypt.compare(req.password, user[0].password);

        if (!isPasswordValid) {
            throw new BadRequestResponse("Invalid username or password");
        }

        const payload: JwtPayload = { userId: user[0].id, username: user[0].username };
        const token = this.jwt.sign(payload, { expiresIn: '1h' });
        const refreshToken = this.jwt.sign(payload, { expiresIn: '12h' });

        await this.db.insert(Session)
        .values({
            userId: user[0].id,
            username: user[0].username,
            refreshToken: refreshToken,
            expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
        });

        const res = new DatabaseResponse(true, 200, { token: token, refreshToken: refreshToken }, "Login successful");

        return res;
    }

    async refreshToken(refreshToken: string) {
        try {
            const session = await this.db.select()
                .from(Session)
                .where(eq(Session.refreshToken, refreshToken))
                .limit(1);

            if(!session || session[0].expiresAt < new Date()) {
                throw new BadRequestResponse("Invalid or expired refresh token");
            }

            const payload: JwtPayload = { userId: session[0].userId, username: session[0].username };
            const newToken = this.jwt.sign(payload, { expiresIn: '1h' });

            const res = new DatabaseResponse(true, 200, { token: newToken }, "Token refreshed successfully");
            return res;

        } catch (error) {
            throw new BadRequestResponse(error.message);
        }
    }

    async logout(refreshToken: string) {
        await this.db.delete(Session).where(eq(Session.refreshToken, refreshToken));
        const res = new DatabaseResponse(true, 200, null, "Logout successful");
        return res;
    }
}
