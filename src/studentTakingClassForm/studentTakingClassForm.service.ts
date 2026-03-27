import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { Class, Schedule, Users } from "src/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";
import { FailDatabaseResponse } from "src/db/response/fail-db.response";
import { StudentTakingClassForm } from "src/db/schema";
import { DatabaseResponse } from "src/db/response/db.response";

@Injectable()
export class StudentTakingClassFormService {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB
    ) { }
    async createStudentTakingClassForm(userId: string, classId: string) {
        try {
            const updated = await this.db.update(Class)
                .set({
                    currentCapacity: sql`${Class.currentCapacity} - 1`,
                })
                .where(
                    and(
                        eq(Class.id, classId),
                        gt(Class.currentCapacity, 0)
                    )
                )
                .returning();

            if (updated.length === 0) {
                throw new FailDatabaseResponse("Failed to enroll in class. Class is full");
            }

            const classWithRelations = await this.db.query.Class.findFirst({
                where: eq(Class.id, classId),
                with: {
                    subject: true,
                },
            });

            const currStudent = await this.db.query.Users.findFirst({
                where: eq(StudentTakingClassForm.studentId, userId),
            });

            if (!classWithRelations || !currStudent) {
                throw new FailDatabaseResponse("Failed to enroll in class. Class or student not found");
            }

            if (currStudent.currentSKS + classWithRelations.subject.sks > 24) {
                throw new FailDatabaseResponse("Failed to enroll in class. SKS limit exceeded");
            }

            const position = updated[0].classCapacity - updated[0].currentCapacity;
            const newForm = await this.db.insert(StudentTakingClassForm)
                .values({
                    studentId: userId,
                    classId: classId,
                    takingPosition: position,
                })
                .returning();

            await this.db.update(Users)
                .set({
                    currentSKS: currStudent.currentSKS + classWithRelations.subject.sks,
                })
                .where(eq(Users.id, userId));

            const response = new DatabaseResponse(true, 201, newForm[0], "Successfully enrolled in class");
            return response;
        } catch (error) {
            throw new FailDatabaseResponse(error.message);
        }
    }

    async deleteStudentTakingClassForm(formId: string) {
        try {
            const form = await this.db.delete(StudentTakingClassForm)
                .where(eq(StudentTakingClassForm.id, formId))
                .returning();

            if (form.length === 0) {
                throw new FailDatabaseResponse("Failed to delete student taking class form. Form not found");
            }

            const classInForm = await this.db.query.Class.findFirst({
                where: eq(Class.id, form[0].classId),
                with: {
                    subject: true,
                },
            });
            const studentInForm = await this.db.query.Users.findFirst({
                where: eq(Users.id, form[0].studentId),
            });

            if (!classInForm || !studentInForm) {
                throw new FailDatabaseResponse("Failed to delete student taking class form. Class or student not found");
            }

            await this.db.update(Class)
                .set({
                    currentCapacity: sql`${Class.currentCapacity} + 1`,
                })
                .where(eq(Class.id, form[0].classId));

            await this.db.update(Users)
                .set({
                    currentSKS: studentInForm.currentSKS - classInForm.subject.sks,
                })
                .where(eq(Users.id, form[0].studentId));

            const response = new DatabaseResponse(true, 200, null, "Successfully deleted student taking class form");
            return response;
        } catch (error) {
            throw new FailDatabaseResponse(error.message);
        }
    }
}