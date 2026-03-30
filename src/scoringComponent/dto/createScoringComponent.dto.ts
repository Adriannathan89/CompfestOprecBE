import { IsInt, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateScoringComponentDto {
    @ApiProperty({ description: "Class id", example: "f633be45-67b4-4f89-a2f6-a0ce09710217" })
    @IsString()
    classId: string;

    @ApiProperty({ description: "Scoring component name", example: "UTS" })
    @IsString()
    name: string;

    @ApiProperty({ description: "Weight percentage (0-100)", example: 40 })
    @IsInt()
    weight: number;
}