import { Controller, Post, Patch, Param, Delete, Req, Body, Get, UseGuards } from "@nestjs/common";
import { StudentTakingClassFormUpdaterService } from "./studentTakingClassFormUpdater.service";
import { StudentFinalizeClassFormService } from "./studentFinalizeClassForm.service";
import { RolesGuard } from "src/guard/roles.guard";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";
import { Roles } from "src/guard/roles-decorator.guard";
import { RoleName } from "src/db/schema";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { EnrollClassDto } from "./dto/enrollClass.dto";
import { StudentTakingClassFormGetterService } from "./studentTakingClassFormGetter.service";


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.STUDENT, RoleName.ADMIN, RoleName.LECTURE)
@Controller("student-taking-class-form")
@ApiTags("Student Taking Class Form")
@ApiBearerAuth("access-token")
export class StudentTakingClassFormController {
    constructor(
        private readonly studentTakingClassFormUpdaterService: StudentTakingClassFormUpdaterService,
        private readonly studentFinalizeClassFormService: StudentFinalizeClassFormService,
        private readonly studentTakingClassFormGetterService: StudentTakingClassFormGetterService
    ) {}

    @Post("enroll")
    @ApiOperation({ summary: "Enroll authenticated user into class" })
    async enrollInClass(@Req() req, @Body() { classId }: EnrollClassDto) {
        const userId = req.user.userId;
        return await this.studentTakingClassFormUpdaterService.createStudentTakingClassForm(userId, classId);
    }

    @Post("finalize")
    @ApiOperation({ summary: "Finalize class form for authenticated user" })
    async finalizeForm(@Req() req) {
        const userId = req.user.userId;
        return await this.studentFinalizeClassFormService.finalizeStudentTakingClassForm(userId);
    }

    @Get("conflicts")
    @ApiOperation({ summary: "Get schedule conflicts for authenticated user" })
    async getConflicts(@Req() req) {
        const userId = req.user.userId;
        return await this.studentFinalizeClassFormService.loadAllConflictClasses(userId);
    }

    @Delete("unenroll/:classId")
    @ApiOperation({ summary: "Unenroll authenticated user from class" })
    async deleteForm(@Param("classId") classId: string, @Req() req) {
        const userId = req.user.userId;
        return await this.studentTakingClassFormUpdaterService.deleteStudentTakingClassForm(classId, userId);
    }

    @Get("forms")
    @ApiOperation({ summary: "Get class forms of authenticated user" })
    async getStudentTakingClassForms(@Req() req) {
        const userId = req.user.userId;
        return await this.studentTakingClassFormGetterService.getStudentTakingClassFormsByStudentId(userId);
    }

    @Get("form/:userTakingClassFormId")
    @ApiOperation({ summary: "Get specific class form for authenticated user" })
    async getStudentTakingClassForm(@Param("userTakingClassFormId") userTakingClassFormId: string) {
        return await this.studentTakingClassFormGetterService.getStudentTakingClassFormById(userTakingClassFormId);
    }
}