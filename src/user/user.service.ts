import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DRIZZLE } from "../db/drizzle.provider";
import type { DrizzleDB } from "../db/drizzle.provider";
import { Users } from "../db/schema/user.schema";
import { RegisterUserDto } from "./dto/register-user.dto";
import * as bcrypt from "bcrypt";
import { DatabaseResponse } from "src/db/db.response";

@Injectable()
export class UserService {
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

    async register(req: RegisterUserDto) {
        const existingUser = await this.db
            .select({ id: Users.id })
            .from(Users)
            .where(eq(Users.username, req.username))
            .limit(1);

        const hashedPassword = await bcrypt.hash(req.password, 10);

        const createdUser = await this.db
            .insert(Users)
            .values({
                username: req.username,
                password: hashedPassword,
            })
            .returning({
                id: Users.id,
                username: Users.username,
            });

        const res = new DatabaseResponse(true, 201, createdUser[0], "User registered successfully");
        return res;
    }
}