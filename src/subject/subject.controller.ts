import { Controller, Post, Body, Get, Patch, Param, UseGuards, Delete } from "@nestjs/common";
import { SubjectService } from "./subject.service";
import { AddSubjectDto } from "./dto/add-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";
import { RolesGuard } from "src/guard/roles.guard";
import { Roles } from "src/guard/roles-decorator.guard";
import { RoleName } from "src/db/schema";

@Controller("subject")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectController {
    constructor(private readonly subjectService: SubjectService) {}

    
    @Roles(RoleName.ADMIN, RoleName.LECTURE)
    @Post("create")
    async createSubject(@Body() payload: AddSubjectDto) {
        return await this.subjectService.createSubject(payload);
    }

    @Roles(RoleName.ADMIN, RoleName.LECTURE)
    @Get("all")
    async getAllSubjects() {
        return await this.subjectService.getAllSubjects();
    }

    @Roles(RoleName.ADMIN, RoleName.LECTURE, RoleName.STUDENT)
    @Get("all-with-details")
    async getAllSubjectsWithDetails() {
        return await this.subjectService.getAllSubjectsWithDetails();
    }

    @Roles(RoleName.ADMIN, RoleName.LECTURE)
    @Get("get/:id")
    async getSubjectById(@Param("id") id: string) {
        return await this.subjectService.getSubjectById(id);
    }

    @Roles(RoleName.ADMIN, RoleName.LECTURE)
    @Patch("update/:id")
    async updateSubject(@Body() payload: UpdateSubjectDto, @Param("id") id: string) {
        return await this.subjectService.updateSubject(id, payload);
    }
    
    @Roles(RoleName.ADMIN, RoleName.LECTURE)
    @Delete("delete/:id")
    async deleteSubject(@Param("id") id: string) {
        return await this.subjectService.deleteSubject(id);
    }
}