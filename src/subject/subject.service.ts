import { Inject, Injectable } from "@nestjs/common";
import { AddSubjectDto } from "./dto/add-subject.dto";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { Subject } from "src/db/schema";
import { DatabaseResponse } from "src/db/db.response";
import { eq } from "drizzle-orm";
import { UpdateSubjectDto } from "./dto/update-subject.dto";

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
                    lecturer: req.lecturer,
                    isLectureHidden: req.isLectureHidden,
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
        const subjects = await this.db.select().from(Subject);
        const databaseResponse = new DatabaseResponse(true, 200, subjects, "Subjects retrieved successfully");
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
            const databaseResponse = new DatabaseResponse(false, 500, null, error.message || "Failed to update subject");
            return databaseResponse;
        }
    }
}