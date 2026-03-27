import { Inject, Injectable } from "@nestjs/common";
import { AddSubjectDto } from "./dto/add-subject.dto";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { Subject } from "src/db/schema";
import { DatabaseResponse } from "src/db/response/db.response";
import { eq } from "drizzle-orm";
import { UpdateSubjectDto } from "./dto/update-subject.dto";
import { FailDatabaseResponse } from "src/db/response/fail-db.response";
import { type SubjectRequestByStudentResponse } from "src/db/response/subjectRequestByStudentResponse";

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
            throw new FailDatabaseResponse("Failed to create subject");
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
        
        
        const res: SubjectRequestByStudentResponse[] = subjects.map(subject => ({
            id: subject.id,
            name: subject.name,
            code: subject.code,
            sks: subject.sks,
            semesterTaken: subject.semesterTaken,
            classes: subject.classes.map(cls => ({
                id: cls.id,
                name: cls.name,
                lecturerName: cls.isHiddenLecturer ? "" : cls.lecturerName,
                isHiddenLecturer: cls.isHiddenLecturer,
                classCapacity: cls.classCapacity,
                currentCapacity: cls.currentCapacity,
                schedules: cls.schedules.map(schedule => ({
                    id: schedule.id,
                    dayOfWeek: schedule.dayOfWeek,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    classroom: schedule.classroom,
                }))
            }))
        }));

        const databaseResponse = new DatabaseResponse(true, 200, res, "Subjects with details retrieved successfully");
        return databaseResponse;
    }

    async getSubjectById(id: string) {
        try {
            const subject = await this.db.query.Subject.findFirst({
                with: {
                    classes: {
                        with: {
                            schedules: true,
                        }
                    }
                },
                where: eq(Subject.id, id),
            });
            const databaseResponse = new DatabaseResponse(true, 200, subject, "Subject retrieved successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to retrieve subject");
        }
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
            throw new FailDatabaseResponse("Failed to update subject");
        }
    }

    async deleteSubject(id: string) {
        try {
            await this.db.delete(Subject).where(eq(Subject.id, id));
            const databaseResponse = new DatabaseResponse(true, 200, null, "Subject deleted successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to delete subject");
        }
    }
}