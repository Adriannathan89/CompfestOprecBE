import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { StudentScoreUpdaterService } from "./studentScoreUpdater.service";
import { InputStudentScoreDto } from "./dto/inputStudentScore.dto";
import { UpdateStudentScoreDto } from "./dto/updateStudentScote.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "src/guard/roles.guard";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";
import { RoleName } from "src/db/schema";
import { Roles } from "src/guard/roles-decorator.guard";
import { StudentScoreGetterService } from "./studentScoreGetter.service";

@Controller("student-score")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags("Student Score")
@ApiBearerAuth("access-token")
export class StudentScoreController {
    constructor(
        private readonly studentScoreUpdaterService: StudentScoreUpdaterService,
        private readonly studentScoreGetterService: StudentScoreGetterService
    ) {}

    @Roles(RoleName.LECTURE, RoleName.ADMIN, RoleName.STUDENT)
    @Get("calculate/:studentTakingClassFormId")
    @ApiOperation({ summary: "Calculate final score for a class form" })
    async calculateFinalScore(@Param("studentTakingClassFormId") studentTakingClassFormId: string) {
        return this.studentScoreGetterService.calculateFinalScore(studentTakingClassFormId);
    }
    
    @Roles(RoleName.LECTURE, RoleName.ADMIN)
    @Post("input")
    @ApiOperation({ summary: "Input student score for scoring component" })
    async inputStudentScore(@Body() req: InputStudentScoreDto) {
        return this.studentScoreUpdaterService.inputStudentScore(req);
    }

    @Roles(RoleName.LECTURE, RoleName.ADMIN)
    @Delete("delete/:id")
    @ApiOperation({ summary: "Delete student score by id" })
    async deleteStudentScore(@Param("id") id: string) {
        return this.studentScoreUpdaterService.deleteStudentScore(id);
    }

    @Roles(RoleName.LECTURE, RoleName.ADMIN, RoleName.STUDENT)
    @Get("get/:studentTakingClassFormId")
    @ApiOperation({ summary: "Get student scores by student taking class form id" })
    async getStudentScoreByStudentTakingClassFormId(@Param("studentTakingClassFormId") studentTakingClassFormId: string) {
        return this.studentScoreGetterService.getStudentScoreByStudentTakingClassFormId(studentTakingClassFormId);
    }
}
