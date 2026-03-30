import { Controller, Post, Patch, Body, Param, Delete, UseGuards, Req, Get } from "@nestjs/common";
import { ClassService } from "./class.service";
import { AddClassDto } from "./dto/add-class.dto";
import { RoleName } from "src/db/schema/role.schema";
import { Roles } from "src/guard/roles-decorator.guard";
import { RolesGuard } from "src/guard/roles.guard";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateClassInfoDto } from "./dto/update-class-info.dto";

@Controller("/class")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.LECTURE)
@ApiTags("Class")
@ApiBearerAuth("access-token")
export class ClassController {
    constructor(
        private readonly classService: ClassService,
    ) { }

    @Post("/create")
    @ApiOperation({ summary: "Create new class" })
    async createClass(@Body() payload: AddClassDto, @Req() req) {
        const username = req.user.username;
        return await this.classService.createNewClass(payload, username);
    }

    @Get("/get/:id")
    @ApiOperation({ summary: "Get class by id" })
    async getClassById(@Param("id") id: string) {
        return await this.classService.getClassById(id);
    }

    @Get("/get-participants/:id")
    @ApiOperation({ summary: "Get class participants by class id" })
    async getClassParticipants(@Param("id") id: string) {
        return await this.classService.getClassParticipants(id);
    }

    @Get("/get-lecturer-classes")
    @ApiOperation({ summary: "Get all classes owned by authenticated lecturer" })
    async getLecturerClasses(@Req() req) {
        const username = req.user.username;
        return await this.classService.lecturerGetOwnClass(username);
    }

    @Patch("/update/:id")
    @ApiOperation({ summary: "Update class info" })
    async updateClassInfo(@Body() payload: UpdateClassInfoDto, @Param("id") id: string) {
        return await this.classService.updateClassInfo(id, payload);
    }

    @Delete("/delete/:id")
    @ApiOperation({ summary: "Delete class by id" })
    async deleteClass(@Param("id") id: string) {
        return await this.classService.deleteClass(id);
    }
}