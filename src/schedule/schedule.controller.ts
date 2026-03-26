import { Controller, UseGuards, Post, Delete, Body, Param, Patch } from "@nestjs/common";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";
import { RolesGuard } from "src/guard/roles.guard";
import { Roles } from "src/guard/roles-decorator.guard";
import { RoleName } from "src/db/schema";
import { ScheduleService } from "./schedule.service";
import { AddScheduleDto } from "./dto/addSchedule.dto";
import { UpdateScheduleDto } from "./dto/updateSchedule.to";


@Controller("schedule")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.LECTURE)
export class ScheduleController {
    constructor(
        private readonly scheduleService: ScheduleService
    ) {}

    @Post("create")
    async createSchedule(@Body() payload: AddScheduleDto) {
        return await this.scheduleService.createNewSchedule(payload);
    }

    @Delete("delete/:id")
    async deleteSchedule(@Param("id") id: string) {
        return await this.scheduleService.deleteSchedule(id);
    }

    @Patch("update/:id")
    async updateSchedule(@Param("id") id: string, @Body() payload: UpdateScheduleDto) {
        return await this.scheduleService.updateSchedule(id, payload);
    }
}