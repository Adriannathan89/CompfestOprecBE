import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { and, eq } from "drizzle-orm";
import { FailDatabaseResponse } from "src/db/response/systemResponse/fail-db.response";
import { StudentTakingClassForm } from "src/db/schema";
import { DatabaseResponse } from "src/db/response/systemResponse/db.response";
import { ConflictRequestResponse } from "src/db/response/systemResponse/conflict-req.response";
import { ClassResponseByStudent } from "src/db/response/customSchemaResponse/classResponseByStudent.response";

interface ScheduleConflict {
    class1Id: string;
    class2Id: string;
}

interface ScheduleType {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classId: string;
}

@Injectable()
export class StudentFinalizeClassFormService {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB
    ) { }

    private toMinutes(time: string) {
        const [hour, minute] = time.split(":").map(Number);
        return hour * 60 + minute;
    }

    private async validateScheduleConflict(studentId: string) {
        const classForms = await this.db.query.StudentTakingClassForm.findMany({
            where: and(
                eq(StudentTakingClassForm.studentId, studentId),
                eq(StudentTakingClassForm.isFinalized, false),
            ),
            with: {
                class: {
                    with: {
                        schedules: true,
                    }
                },
            }
        });

        const allSchedules = classForms.flatMap(form => form.class.schedules as ScheduleType[]);

        const schedulesByDay = new Map<number, ScheduleType[]>();
        for (const schedule of allSchedules) {
            const list = schedulesByDay.get(schedule.dayOfWeek) || [];
            list.push(schedule);
            schedulesByDay.set(schedule.dayOfWeek, list);
        }

        const conflictPairs = new Set<string>();

        //demn naive solution is fineded
        for (const daySchedules of schedulesByDay.values()) {
            for (let i = 0; i < daySchedules.length; i++) {
                const scheduleA = daySchedules[i];
                const startA = this.toMinutes(scheduleA.startTime);
                const endA = this.toMinutes(scheduleA.endTime);

                for (let j = i + 1; j < daySchedules.length; j++) {
                    const scheduleB = daySchedules[j];
                    if (scheduleA.classId === scheduleB.classId) {
                        continue;
                    }

                    const startB = this.toMinutes(scheduleB.startTime);
                    const endB = this.toMinutes(scheduleB.endTime);
                    const isOverlap = startA < endB && startB < endA;

                    if (isOverlap) {
                        const [first, second] = [scheduleA.classId, scheduleB.classId].sort();
                        conflictPairs.add(`${first}|${second}`);
                    }
                }
            }
        }

        const conflicts: ScheduleConflict[] = Array.from(conflictPairs).map(pair => {
            const [class1Id, class2Id] = pair.split("|");
            return { class1Id, class2Id };
        });

        return { hasConflict: conflicts.length > 0, conflicts };
    }

    async loadAllConflictClasses(userId: string) {
        const res = await this.validateScheduleConflict(userId);

        if (!res.hasConflict) {
            const databaseResponse = new DatabaseResponse(true, 200, [], "No schedule conflicts detected");
            return databaseResponse;
        }

        const allForms = await this.db.query.StudentTakingClassForm.findMany({
            where: and(
                eq(StudentTakingClassForm.studentId, userId),
                eq(StudentTakingClassForm.isFinalized, false),
            ),
            with: {
                class: {
                    with: {
                        schedules: true,
                    }
                }
            }
        });
        const allClasses = allForms.map(form => form.class);
        const classById = new Map(allClasses.map(cls => [cls.id, cls]));

        const allConflictClasses = res.conflicts.map(conflict => {
            const classData1 = classById.get(conflict.class1Id) as any;
            const classData2 = classById.get(conflict.class2Id) as any;

            const class1: ClassResponseByStudent = {
                id: classData1.id,
                name: classData1.name,
                schedules: classData1.schedules,
                lecturerName: classData1.isHiddenLecturer ? "" : classData1.lecturerName,
                isHiddenLecturer: classData1.isHiddenLecturer,
                classCapacity: classData1.classCapacity,
                currentCapacity: classData1.currentCapacity,
            };

            const class2: ClassResponseByStudent = {
                id: classData2.id,
                name: classData2.name,
                schedules: classData2.schedules,
                lecturerName: classData2.isHiddenLecturer ? "" : classData2.lecturerName,
                isHiddenLecturer: classData2.isHiddenLecturer,
                classCapacity: classData2.classCapacity,
                currentCapacity: classData2.currentCapacity,
            };

            return { class1, class2 };
        }).filter(item => item.class1 && item.class2);

        const databaseResponse = new DatabaseResponse(true, 200, allConflictClasses, "Conflict classes retrieved successfully");

        return databaseResponse;
    }

    async finalizeStudentTakingClassForm(userId: string) {
        try {
            const res = await this.validateScheduleConflict(userId);

            if (res.hasConflict) {
                throw new ConflictRequestResponse("Schedule conflict detected", res.conflicts);
            }

            await this.db.update(StudentTakingClassForm)
                .set({
                    isFinalized: true,
                })
                .where(
                    and(
                        eq(StudentTakingClassForm.studentId, userId),
                        eq(StudentTakingClassForm.isFinalized, false)
                    )
                )
                .returning();

            const response = new DatabaseResponse(true, 200, null, "Successfully finalized class form");
            return response;
        } catch (error) {

            if (error instanceof ConflictRequestResponse) {
                throw error;
            }
            throw new FailDatabaseResponse(error.message || "Failed to finalize class form");
        }
    }
}