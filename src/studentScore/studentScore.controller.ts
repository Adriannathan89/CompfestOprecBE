import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { StudentScoreService } from "./studentScore.service";
import { InputStudentScoreDto } from "./dto/inputStudentScore.dto";
import { UpdateStudentScoreDto } from "./dto/updateStudentScote.dto";

@Controller("student-score")
export class StudentScoreController {
    constructor(
        private readonly studentScoreService: StudentScoreService
    ) {}

    @Get("calculate/:studentTakingClassFormId")
    async calculateFinalScore(@Param("studentTakingClassFormId") studentTakingClassFormId: string) {
        return this.studentScoreService.calculateFinalScore(studentTakingClassFormId);
    }
    
    @Post("input")
    async inputStudentScore(@Body() req: InputStudentScoreDto) {
        return this.studentScoreService.inputStudentScore(req);
    }

    @Patch("update/:id")
    async updateStudentScore(@Param("id") id: string, @Body() req: UpdateStudentScoreDto) {
        return this.studentScoreService.updateStudentScore(id, req);
    }

    @Delete("delete/:id")
    async deleteStudentScore(@Param("id") id: string) {
        return this.studentScoreService.deleteStudentScore(id);
    }
}
