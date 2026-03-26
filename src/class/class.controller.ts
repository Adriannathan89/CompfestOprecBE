import { Controller, Post, Patch, Body, Param, Delete, UseGuards, Req, Get } from "@nestjs/common";
import { ClassService } from "./class.service";
import { AddClassDto } from "./dto/add-class.dto";
import { RoleName } from "src/db/schema/role.schema";
import { Roles } from "src/guard/roles-decorator.guard";
import { RolesGuard } from "src/guard/roles.guard";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";

@Controller("/class")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.LECTURE)
export class ClassController {
    constructor(
        private readonly classService: ClassService,
    ) { }

    @Post("/create")
    async createClass(@Body() payload: AddClassDto, @Req() req) {
        const username = req.user.username;
        return await this.classService.createNewClass(payload, username);
    }

    @Get("/get/:id")
    async getClassById(@Param("id") id: string) {
        return await this.classService.getClassById(id);
    }

    @Get("/get-lecturer-classes")
    async getLecturerClasses(@Req() req) {
        const username = req.user.username;
        return await this.classService.lecturerGetOwnClass(username);
    }

    @Patch("/update/:id")
    async updateClassInfo(@Body() payload: AddClassDto, @Param("id") id: string) {
        return await this.classService.updateClassInfo(id, payload);
    }

    @Delete("/delete/:id")
    async deleteClass(@Param("id") id: string) {
        return await this.classService.deleteClass(id);
    }
}