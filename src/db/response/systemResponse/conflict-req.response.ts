import { BadRequestException } from "@nestjs/common";

export class ConflictRequestResponse extends BadRequestException {
    constructor(message: string, conflicts: { class1Id: string; class2Id: string }[]) {
        super(message);
        this.conflicts = conflicts;
    }
    statusCode = 400;
    success = false;
    conflicts: {
        class1Id: string;
        class2Id: string;
    }[] = [];
}