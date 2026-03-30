import { Controller, Post, Delete, Patch, Body, Get, Param } from "@nestjs/common";
import { ScoringComponentService } from "./scoringComponent.service";
import { CreateScoringComponentDto } from "./dto/createScoringComponent.dto";
import { UpdateScoringComponentDto } from "./dto/updateScoringComponent.dto";

@Controller("scoring-component")
export class ScoringComponentController {
    constructor(
        private readonly scoringComponentService: ScoringComponentService
    ) {}

    @Post("create")
    async createScoringComponent(@Body() req: CreateScoringComponentDto) {
        return this.scoringComponentService.createScoringComponent(req);
    }

    @Get("get/:classId")
    async getScoringComponentsByClassId(@Param("classId") classId: string) {
        return this.scoringComponentService.getScoringComponentsByClassId(classId);
    }

    @Delete("delete/:id")
    async deleteScoringComponent(@Param("id") id: string) {
        return this.scoringComponentService.deleteScoringComponent(id);
    }

    @Patch("update/:id")
    async updateScoringComponent(@Param("id") id: string, @Body() req: UpdateScoringComponentDto) {
        return this.scoringComponentService.updateScoringComponent(id, req);
    }
}