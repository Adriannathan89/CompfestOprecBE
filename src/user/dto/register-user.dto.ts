import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterUserDto {
  @ApiProperty({
    description: "Unique username",
    example: "john_doe",
  })
  @IsString()
  username!: string;

  @ApiProperty({
    description: "Raw password for new account",
    example: "StrongPassword123",
  })
  @IsString()
  password!: string;
}
