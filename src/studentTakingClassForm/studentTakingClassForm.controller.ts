import { Controller, Post, Patch, Param, Delete, Req, Body, Get } from "@nestjs/common";
import { StudentTakingClassFormService } from "./studentTakingClassForm.service";
import { StudentFinalizeClassFormService } from "./studentFinalizeClassForm.service";

@Controller("student-taking-class-form")
export class StudentTakingClassFormController {
    constructor(
        private readonly studentTakingClassFormService: StudentTakingClassFormService,
        private readonly studentFinalizeClassFormService: StudentFinalizeClassFormService
    ) {}

    @Post("enroll")
    async enrollInClass(@Req() req, @Body() { classId }: { classId: string }) {
        const userId = req.user.id;
        return await this.studentTakingClassFormService.createStudentTakingClassForm(userId, classId);
    }

    @Post("finalize")
    async finalizeForm(@Req() req) {
        const userId = req.user.id;
        return await this.studentFinalizeClassFormService;
    }

    @Get("conflicts")
    async getConflicts(@Req() req) {
        const userId = req.user.id;
        return await this.studentFinalizeClassFormService.loadAllConflictClasses(userId);
    }

    @Delete("delete/:formId")
    async deleteForm(@Param("formId") formId: string) {
        return await this.studentTakingClassFormService.deleteStudentTakingClassForm(formId);
    }
}