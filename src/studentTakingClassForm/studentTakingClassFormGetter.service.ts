import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { DatabaseResponse } from "src/db/response/systemResponse/db.response";
import { FailDatabaseResponse } from "src/db/response/systemResponse/fail-db.response";
import { eq } from "drizzle-orm";
import { StudentTakingClassForm } from "src/db/schema";
import { ClassParticipantResponse } from "src/db/response/customSchemaResponse/classParticipant.response";

@Injectable()
export class StudentTakingClassFormGetterService {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB
    ) { }

    async getStudentTakingClassFormsByStudentId(studentId: string) {
        try {
            const forms = await this.db.query.StudentTakingClassForm.findMany({
                where: eq(StudentTakingClassForm.studentId, studentId),
                with: {
                    class: {
                        with: {
                            subject: true,
                        }
                    }
                }
            });
            const response = new DatabaseResponse(true, 200, forms, "Successfully retrieved student taking class forms");
            return response;
        } catch (error) {
            throw new FailDatabaseResponse(error.message || "Failed to retrieve student taking class forms");
        }
    }

    async getStudentTakingClassFormById(formId: string) {
        try {
            const form = await this.db.query.StudentTakingClassForm.findFirst({
                where: eq(StudentTakingClassForm.id, formId),
                with: {
                    class: true,
                    student: true,
                }
            });

            if (!form) {
                throw new FailDatabaseResponse("Student taking class form not found");
            }

            const mappedForm: ClassParticipantResponse = {
                id: form.id,
                studentId: form.studentId,
                classId: form.classId,
                takingPosition: form.takingPosition,
                isFinalized: form.isFinalized,
                createdAt: form.createdAt,
                student: {
                    username: form.student.username,
                },
                class: {
                    name: form.class.name,
                }
            }

            const response = new DatabaseResponse(true, 200, mappedForm, "Successfully retrieved student taking class form");
            return response;
        } catch (error) {
            throw new FailDatabaseResponse(error.message || "Failed to retrieve student taking class form");
        }
    }
}