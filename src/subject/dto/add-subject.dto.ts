import { IsBoolean, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddSubjectDto {
    @ApiProperty({ description: "Subject name", example: "Algoritma dan Struktur Data" })
    @IsString()
    name: string;

    @ApiProperty({ description: "Subject code", example: "IF201" })
    @IsString()
    code: string;

    @ApiProperty({ description: "Credit units (SKS)", example: 3 })
    @IsNumber()
    sks: number;

    @ApiProperty({ description: "Semester where the subject is usually taken", example: 3 })
    @IsNumber()
    semesterTaken: number;
}