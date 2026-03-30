import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { StudentScoreService } from "./studentScore.service";
import { InputStudentScoreDto } from "./dto/inputStudentScore.dto";
import { UpdateStudentScoreDto } from "./dto/updateStudentScote.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("student-score")
@ApiTags("Student Score")
@ApiBearerAuth("access-token")
export class StudentScoreController {
    constructor(
        private readonly studentScoreService: StudentScoreService
    ) {}

    @Get("calculate/:studentTakingClassFormId")
    @ApiOperation({ summary: "Calculate final score for a class form" })
    async calculateFinalScore(@Param("studentTakingClassFormId") studentTakingClassFormId: string) {
        return this.studentScoreService.calculateFinalScore(studentTakingClassFormId);
    }
    
    @Post("input")
    @ApiOperation({ summary: "Input student score for scoring component" })
    async inputStudentScore(@Body() req: InputStudentScoreDto) {
        return this.studentScoreService.inputStudentScore(req);
    }

    @Patch("update/:id")
    @ApiOperation({ summary: "Update student score by id" })
    async updateStudentScore(@Param("id") id: string, @Body() req: UpdateStudentScoreDto) {
        return this.studentScoreService.updateStudentScore(id, req);
    }

    @Delete("delete/:id")
    @ApiOperation({ summary: "Delete student score by id" })
    async deleteStudentScore(@Param("id") id: string) {
        return this.studentScoreService.deleteStudentScore(id);
    }
}
