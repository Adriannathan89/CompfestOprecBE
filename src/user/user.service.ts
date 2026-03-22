
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../db/drizzle.provider";
import type { DrizzleDB } from "../db/drizzle.provider";
import { Users } from "../db/schema/user.schema";
import { RegisterUserDto } from "./dto/register-user.dto";
import * as bcrypt from "bcrypt";
import { DatabaseResponse } from "src/db/db.response";
import { Role } from "src/db/schema/role.schema";
import { UserRole } from "src/db/schema";

@Injectable()
export class UserService {
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) { }

    async register(req: RegisterUserDto) {
        const hashedPassword = await bcrypt.hash(req.password, 10);

        const studentRole = await this.db.query.Role.findFirst({
            where: eq(Role.name, "STUDENT"),
        });

        if (!studentRole) {
            const res = new DatabaseResponse(false, 500, null, "Default role not found");
            return res;
        }

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
        try {
            const assignedRole = await this.db.insert(UserRole)
                .values({
                    userId: createdUser[0].id,
                    roleId: studentRole.id,
                });
            const res = new DatabaseResponse(true, 201, createdUser[0], "User registered successfully");
            return res;
            
        } catch (error) {
            await this.db.delete(Users).where(eq(Users.id, createdUser[0].id));
            const res = new DatabaseResponse(false, 500, null, "Failed to assign role to user");
            return res;
        }
    }
}