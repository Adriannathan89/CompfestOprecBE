
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../db/drizzle.provider";
import type { DrizzleDB } from "../db/drizzle.provider";
import { Users } from "../db/schema/user.schema";
import { RegisterUserDto } from "./dto/register-user.dto";
import * as bcrypt from "bcrypt";
import { DatabaseResponse } from "src/db/response/systemResponse/db.response";
import { Role } from "src/db/schema/role.schema";
import { StudentTakingClassForm, UserRole } from "src/db/schema";
import { FailDatabaseResponse } from "src/db/response/systemResponse/fail-db.response";

@Injectable()
export class UserService {
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) { }

    async register(req: RegisterUserDto) {
        const hashedPassword = await bcrypt.hash(req.password, 10);

        const studentRole = await this.db.query.Role.findFirst({
            where: eq(Role.name, "STUDENT"),
        });

        if (!studentRole) {
            throw new FailDatabaseResponse("Student role not found");
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
            throw new FailDatabaseResponse("Failed to assign role to user");
        }
    }

    async getFinalizeStatus(userId: string) {
        try {
            const takingForms = await this.db.query.StudentTakingClassForm.findMany({
                where: eq(StudentTakingClassForm.studentId, userId),
            });
            const isFinalized = takingForms[0].isFinalized;

            const res = new DatabaseResponse(true, 200, { isFinalized }, "Finalize status retrieved successfully");
            return res;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to retrieve finalize status");
        }
    }
}