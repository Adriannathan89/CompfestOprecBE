import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { and, eq } from "drizzle-orm";
import { FailDatabaseResponse } from "src/db/response/fail-db.response";
import { StudentTakingClassForm } from "src/db/schema";
import { DatabaseResponse } from "src/db/response/db.response";
import { ConflictRequestResponse } from "src/db/response/conflict-req.response";

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
            return [];
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
            const class1 = classById.get(conflict.class1Id);
            const class2 = classById.get(conflict.class2Id);
            return { class1, class2 };
        }).filter(item => item.class1 && item.class2);

        return allConflictClasses;
    }

    async finalizeStudentTakingClassForm(userId: string) {
        try {
            const res = await this.validateScheduleConflict(userId);

            if (res.hasConflict) {
                throw new ConflictRequestResponse("Schedule conflict detected", res.conflicts);
            }

            const updatedForms = await this.db.update(StudentTakingClassForm)
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

            const response = new DatabaseResponse(true, 200, updatedForms, "Successfully finalized class form");
            return response;
        } catch (error) {

            if (error instanceof ConflictRequestResponse) {
                throw error;
            }
            throw new FailDatabaseResponse(error.message || "Failed to finalize class form");
        }
    }
}