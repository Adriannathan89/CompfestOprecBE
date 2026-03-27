import { Inject, Injectable } from "@nestjs/common";
import { AddScheduleDto } from "./dto/addSchedule.dto";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { Schedule } from "src/db/schema/schedule.schema";
import { DatabaseResponse } from "src/db/response/db.response";
import { FailDatabaseResponse } from "src/db/response/fail-db.response";
import { eq } from "drizzle-orm";
import { UpdateScheduleDto } from "./dto/updateSchedule.to";

@Injectable()
export class ScheduleService {
    constructor(@Inject(DRIZZLE) private readonly drizzle: DrizzleDB) {}

    async createNewSchedule(req: AddScheduleDto) {
        try {
        const newSchedule = await this.drizzle.insert(Schedule).values({
            dayOfWeek: req.dayOfWeek,
            startTime: req.startTime,
            endTime: req.endTime,
            classId: req.classId,
            classroom: req.classroom,
        }).returning();

        const res = new DatabaseResponse(true, 201, newSchedule[0], "Schedule created successfully");
        return res;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to create schedule");
        }
    }

    async deleteSchedule(id: string) {
        try {
            await this.drizzle.delete(Schedule)
                .where(eq(Schedule.id, id));
            
            const res = new DatabaseResponse(true, 200, null, "Schedule deleted successfully");
            return res;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to delete schedule");
        }
    }

    async updateSchedule(id: string, req: UpdateScheduleDto) {
        try {
            const updatedSchedule = await this.drizzle.update(Schedule)
                .set(req)
                .where(eq(Schedule.id, id))
                .returning();

            const res = new DatabaseResponse(true, 200, updatedSchedule[0], "Schedule updated successfully");
            return res;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to update schedule");
        }
    }
}