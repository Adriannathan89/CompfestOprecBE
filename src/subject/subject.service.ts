import { Inject, Injectable } from "@nestjs/common";
import { AddSubjectDto } from "./dto/add-subject.dto";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { Subject } from "src/db/schema";
import { DatabaseResponse } from "src/db/response/db.response";
import { eq } from "drizzle-orm";
import { UpdateSubjectDto } from "./dto/update-subject.dto";
import { FailDatabaseResponse } from "src/db/response/fail-db.response";

@Injectable()
export class SubjectService {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB
    ) { }
    async createSubject(req: AddSubjectDto) {
        try {
            const newSubject = await this.db.insert(Subject)
                .values({
                    name: req.name,
                    code: req.code,
                    sks: req.sks,
                    semesterTaken: req.semesterTaken,
                })
                .returning();

            const databaseResponse = new DatabaseResponse(true, 201, newSubject[0], "Subject created successfully");

            return databaseResponse;
        } catch (error) {
            const databaseResponse = new DatabaseResponse(false, 500, null, error.message || "Failed to create subject");
            return databaseResponse;
        }
    }

    async getAllSubjects() {
        const subjects = await this.db.query.Subject.findMany();

        const databaseResponse = new DatabaseResponse(true, 200, subjects, "Subjects retrieved successfully");
        return databaseResponse;
    }

    async getAllSubjectsWithDetails() {
        const subjects = await this.db.query.Subject.findMany({
            with: {
                classes: {
                    with: {
                        schedules: true,
                    }
                }
            },
        });

        const databaseResponse = new DatabaseResponse(true, 200, subjects, "Subjects with details retrieved successfully");
        return databaseResponse;
    }

    async updateSubject(id: string, req: UpdateSubjectDto) {
        try {
            const updatedSubject = await this.db.update(Subject)
                .set(req)
                .where(eq(Subject.id, id))
                .returning();

            const databaseResponse = new DatabaseResponse(true, 200, updatedSubject[0], "Subject updated successfully");
            return databaseResponse;

        } catch (error) {
            const databaseResponse = new FailDatabaseResponse(error.message || "Failed to update subject");
            return databaseResponse;
        }
    }

    async deleteSubject(id: string) {
        try {
            await this.db.delete(Subject).where(eq(Subject.id, id));
            const databaseResponse = new DatabaseResponse(true, 200, null, "Subject deleted successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse(error.message || "Failed to delete subject");
        }
    }
}