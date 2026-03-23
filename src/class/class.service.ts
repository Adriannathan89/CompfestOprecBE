import { Inject } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { Injectable } from "@nestjs/common";
import { AddClassDto } from "./dto/add-class.dto";
import { Class } from "src/db/schema";
import { DatabaseResponse } from "src/db/response/db.response";
import { FailDatabaseResponse } from "src/db/response/fail-db.response";
import { UpdateClassInfoDto } from "./dto/update-class-info.dto";
import { eq } from "drizzle-orm";

@Injectable()
export class ClassService {
    constructor(
        @Inject(DRIZZLE) private db: DrizzleDB
    ) {}

    async createNewClass(req: AddClassDto) {
        try {
            const newClass = await this.db.insert(Class)
                .values({
                    name: req.name,
                    subjectId: req.subjectId,
                    lecturerName: req.lecturerName,
                    isHiddenLecturer: req.isHiddenLecturer,
                    classCapacity: req.classCapacity,
                })
                .returning();
            const databaseResponse = new DatabaseResponse(true, 201, newClass[0], "Class created successfully");
            return databaseResponse;

        } catch (error) {
            throw new FailDatabaseResponse(error.message || "Failed to create class");
        }
    }

    async updateClassInfo(id: string, req: UpdateClassInfoDto) {
        try {
            const updatedClass = await this.db.update(Class)
                .set(req)
                .where(eq(Class.id, id))
                .returning();
            const databaseResponse = new DatabaseResponse(true, 200, updatedClass[0], "Class updated successfully");
            return databaseResponse;

        } catch (error) {
            throw new FailDatabaseResponse(error.message || "Failed to update class");
        }

    }

    async deleteClass(id: string) {
        try {
            await this.db.delete(Class).where(eq(Class.id, id));
            const databaseResponse = new DatabaseResponse(true, 200, null, "Class deleted successfully");
            return databaseResponse;
        }
        catch (error) {
            throw new FailDatabaseResponse(error.message || "Failed to delete class");
        }
    }
}