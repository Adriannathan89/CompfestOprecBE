import { IsBoolean, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class InputStudentScoreDto {
    @ApiProperty({
        description: "Student taking class form id",
        example: "31f7f1b5-66cf-479b-9859-28ef48a922eb",
    })
    @IsString()
    studentTakingClassFormId: string;

    @ApiProperty({
        description: "Scoring component id",
        example: "7508ff64-cf45-4a95-bfb9-48f2f16dc45f",
    })
    @IsString()
    scoringComponentId: string;

    @ApiProperty({
        description: "Score percentage value as string, e.g. 80 or 80.5",
        example: "80",
    })
    @IsString()
    percentage: string;

    @ApiProperty({
        description: "Publication status of this score",
        example: true,
    })
    @IsBoolean()
    isPublished: boolean;
}