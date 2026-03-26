import { Inject } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { Injectable } from "@nestjs/common";
import { AddClassDto } from "./dto/add-class.dto";
import { Class, StudentTakingClassForm } from "src/db/schema";
import { DatabaseResponse } from "src/db/response/db.response";
import { FailDatabaseResponse } from "src/db/response/fail-db.response";
import { UpdateClassInfoDto } from "./dto/update-class-info.dto";
import { eq } from "drizzle-orm";

@Injectable()
export class ClassService {
    constructor(
        @Inject(DRIZZLE) private db: DrizzleDB
    ) {}

    async createNewClass(req: AddClassDto, username: string) {
        try {
            const newClass = await this.db.insert(Class)
                .values({
                    name: req.name,
                    subjectId: req.subjectId,
                    lecturerName: username,
                    isHiddenLecturer: req.isHiddenLecturer,
                    classCapacity: req.classCapacity,
                    currentCapacity: req.classCapacity,
                })
                .returning();
            const databaseResponse = new DatabaseResponse(true, 201, newClass[0], "Class created successfully");
            return databaseResponse;

        } catch (error) {
            throw new FailDatabaseResponse(error.message || "Failed to create class");
        }
    }

    async getClassById(id: string) {
        try {
            const classData = await this.db.query.Class.findFirst({
                where: eq(Class.id, id),
            });
            const databaseResponse = new DatabaseResponse(true, 200, classData, "Class retrieved successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse(error.message || "Failed to retrieve class");
        }
    }

    async updateClassInfo(id: string, req: UpdateClassInfoDto) {
        try {
            let currentCapacity = req.classCapacity;

            if(req.classCapacity !== undefined) {
                const existingForm = await this.db.query.StudentTakingClassForm.findMany({
                    where: eq(StudentTakingClassForm.classId, id),
                });

                if(existingForm.length > req.classCapacity) {
                    throw new FailDatabaseResponse("New class capacity cannot be less than the number of students currently taking the class");
                }

                if (existingForm.length > 0) {
                    currentCapacity = req.classCapacity - existingForm.length;
                }
            }
            const updatePayload = {
                ...req,
                ...(req.classCapacity !== undefined ? { currentCapacity: currentCapacity } : {}),
            };

            const updatedClass = await this.db.update(Class)
                .set(updatePayload)
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

    async lecturerGetOwnClass(lecturerName: string) {
        try {
            const classes = await this.db.query.Class.findMany({
                where: eq(Class.lecturerName, lecturerName),
            });

            const databaseResponse = new DatabaseResponse(true, 200, classes, "Classes retrieved successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse(error.message || "Failed to retrieve classes");
        }
    }
}