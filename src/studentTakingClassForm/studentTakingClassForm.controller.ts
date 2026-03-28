import { Controller, Post, Patch, Param, Delete, Req, Body, Get, UseGuards } from "@nestjs/common";
import { StudentTakingClassFormService } from "./studentTakingClassForm.service";
import { StudentFinalizeClassFormService } from "./studentFinalizeClassForm.service";
import { RolesGuard } from "src/guard/roles.guard";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";
import { Roles } from "src/guard/roles-decorator.guard";
import { RoleName } from "src/db/schema";


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.STUDENT, RoleName.ADMIN, RoleName.LECTURE)
@Controller("student-taking-class-form")
export class StudentTakingClassFormController {
    constructor(
        private readonly studentTakingClassFormService: StudentTakingClassFormService,
        private readonly studentFinalizeClassFormService: StudentFinalizeClassFormService
    ) {}

    @Post("enroll")
    async enrollInClass(@Req() req, @Body() { classId }: { classId: string }) {
        const userId = req.user.userId;
        return await this.studentTakingClassFormService.createStudentTakingClassForm(userId, classId);
    }

    @Post("finalize")
    async finalizeForm(@Req() req) {
        const userId = req.user.userId;
        return await this.studentFinalizeClassFormService.finalizeStudentTakingClassForm(userId);
    }

    @Get("conflicts")
    async getConflicts(@Req() req) {
        const userId = req.user.userId;
        return await this.studentFinalizeClassFormService.loadAllConflictClasses(userId);
    }

    @Delete("unenroll/:classId")
    async deleteForm(@Param("classId") classId: string, @Req() req) {
        const userId = req.user.userId;
        return await this.studentTakingClassFormService.deleteStudentTakingClassForm(classId, userId);
    }

    @Get("forms")
    async getStudentTakingClassForms(@Req() req) {
        const userId = req.user.userId;
        return await this.studentTakingClassFormService.getStudentTakingClassFormsByStudentId(userId);
    }

}