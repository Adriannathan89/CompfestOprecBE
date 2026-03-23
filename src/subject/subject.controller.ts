import { Controller, Post, Body, Get, Patch, Param, UseGuards, Delete } from "@nestjs/common";
import { SubjectService } from "./subject.service";
import { AddSubjectDto } from "./dto/add-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";
import { RolesGuard } from "src/guard/roles.guard";
import { Roles } from "src/guard/roles-decorator.guard";
import { RoleName } from "src/db/schema";

@Controller("subject")
export class SubjectController {
    constructor(private readonly subjectService: SubjectService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN, RoleName.LECTURE)
    @Post("create")
    async createSubject(@Body() payload: AddSubjectDto) {
        return await this.subjectService.createSubject(payload);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN, RoleName.LECTURE)
    @Patch("update/:id")
    async updateSubject(@Body() payload: UpdateSubjectDto, @Param("id") id: string) {
        return await this.subjectService.updateSubject(id, payload);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN, RoleName.LECTURE, RoleName.STUDENT)
    @Get("all")
    async getAllSubjects() {
        return await this.subjectService.getAllSubjects();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN, RoleName.LECTURE)
    @Delete("delete/:id")
    async deleteSubject(@Param("id") id: string) {
        return await this.subjectService.deleteSubject(id);
    }
}