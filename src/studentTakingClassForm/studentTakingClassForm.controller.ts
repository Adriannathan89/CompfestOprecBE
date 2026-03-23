import { Controller, Post, Patch, Param, Delete } from "@nestjs/common";
import { StudentTakingClassFormService } from "./studentTakingClassForm.service";

@Controller("student-taking-class-form")
export class StudentTakingClassFormController {
    constructor(private readonly studentTakingClassFormService: StudentTakingClassFormService) {}

    @Post("enroll")
    async enrollInClass(userId: string, classId: string) {
        return await this.studentTakingClassFormService.createStudentTakingClassForm(userId, classId);
    }

    @Patch("approve/:formId")
    async approveForm(@Param("formId") formId: string) {
        return await this.studentTakingClassFormService.approveStudentTakingClassForm(formId);
    }

    @Delete("delete/:formId")
    async deleteForm(@Param("formId") formId: string) {
        return await this.studentTakingClassFormService.deleteStudentTakingClassForm(formId);
    }
}