import { IsString, IsBoolean, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddClassDto {
    @ApiProperty({ description: "Class name", example: "Kelas A" })
    @IsString()
    name: string;

    @ApiProperty({ description: "Subject id", example: "f633be45-67b4-4f89-a2f6-a0ce09710217" })
    @IsString()
    subjectId: string;
    
    @ApiProperty({ description: "Hide lecturer name from students", example: false })
    @IsBoolean()
    isHiddenLecturer: boolean;

    @ApiProperty({ description: "Maximum class capacity", example: 30 })
    @IsNumber()
    classCapacity: number;
}