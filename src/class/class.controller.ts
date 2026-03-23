import { Controller, Post, Patch, Body, Param, Delete, UseGuards } from "@nestjs/common";
import { ClassService } from "./class.service";
import { AddClassDto } from "./dto/add-class.dto";
import { RoleName } from "src/db/schema/role.schema";
import { Roles } from "src/guard/roles-decorator.guard";
import { RolesGuard } from "src/guard/roles.guard";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";

@Controller("/class")
export class ClassController {
    constructor(
        private readonly classService: ClassService,
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN, RoleName.LECTURE)
    @Post("/create")
    async createClass(@Body() payload: AddClassDto) {
        return await this.classService.createNewClass(payload);
    }
    
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN, RoleName.LECTURE)
    @Patch("/update/:id")
    async updateClassInfo(@Body() payload: AddClassDto, @Param("id") id: string) {
        return await this.classService.updateClassInfo(id, payload);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN, RoleName.LECTURE)
    @Delete("/delete/:id")
    async deleteClass(@Param("id") id: string) {
        return await this.classService.deleteClass(id);
    }
}