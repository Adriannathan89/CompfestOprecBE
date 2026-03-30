import { Controller, Post, Delete, Patch, Body, Get, Param } from "@nestjs/common";
import { ScoringComponentService } from "./scoringComponent.service";
import { CreateScoringComponentDto } from "./dto/createScoringComponent.dto";
import { UpdateScoringComponentDto } from "./dto/updateScoringComponent.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("scoring-component")
@ApiTags("Scoring Component")
@ApiBearerAuth("access-token")
export class ScoringComponentController {
    constructor(
        private readonly scoringComponentService: ScoringComponentService
    ) {}

    @Post("create")
    @ApiOperation({ summary: "Create scoring component" })
    async createScoringComponent(@Body() req: CreateScoringComponentDto) {
        return this.scoringComponentService.createScoringComponent(req);
    }

    @Get("get/:classId")
    @ApiOperation({ summary: "Get scoring components by class id" })
    async getScoringComponentsByClassId(@Param("classId") classId: string) {
        return this.scoringComponentService.getScoringComponentsByClassId(classId);
    }

    @Delete("delete/:id")
    @ApiOperation({ summary: "Delete scoring component by id" })
    async deleteScoringComponent(@Param("id") id: string) {
        return this.scoringComponentService.deleteScoringComponent(id);
    }

    @Patch("update/:id")
    @ApiOperation({ summary: "Update scoring component by id" })
    async updateScoringComponent(@Param("id") id: string, @Body() req: UpdateScoringComponentDto) {
        return this.scoringComponentService.updateScoringComponent(id, req);
    }
}