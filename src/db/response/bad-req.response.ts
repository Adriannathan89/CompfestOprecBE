import { BadRequestException } from "@nestjs/common";

export class BadRequestResponse extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
    statucCode = 400;
    success = false;
}