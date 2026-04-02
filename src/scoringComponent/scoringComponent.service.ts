import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "src/db/drizzle.provider";
import { CreateScoringComponentDto } from "./dto/createScoringComponent.dto";
import { ScoringComponent } from "src/db/schema/scoringComponent.schema";
import { DatabaseResponse } from "src/db/response/systemResponse/db.response";
import { FailDatabaseResponse } from "src/db/response/systemResponse/fail-db.response";
import { eq } from "drizzle-orm";
import { UpdateScoringComponentDto } from "./dto/updateScoringComponent.dto";

@Injectable()
export class ScoringComponentService {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB
    ) {}

    async createScoringComponent(req: CreateScoringComponentDto) {
        try {
            const newComponent = await this.db.insert(ScoringComponent)
                .values({
                    classId: req.classId,
                    name: req.name,
                    weight: req.weight,
                })
                .returning();
            
            const databaseResponse = new DatabaseResponse(true, 201, newComponent[0], "Scoring component created successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to create scoring component");
        }
    }

    async getScoringComponentsByClassId(classId: string) {
        try {
            const components = await this.db.query.ScoringComponent.findMany({
                where: eq(ScoringComponent.classId, classId),
            });
            const databaseResponse = new DatabaseResponse(true, 200, components, "Scoring components retrieved successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to retrieve scoring components");
        }
    }

    async deleteScoringComponent(id: string) {
        try {
            await this.db.delete(ScoringComponent)
                .where(eq(ScoringComponent.id, id));
            const databaseResponse = new DatabaseResponse(true, 200, null, "Scoring component deleted successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to delete scoring component");
        }
    }

    async updateScoringComponent(id: string, req: UpdateScoringComponentDto) {
        try {
            const updatedComponent = await this.db.update(ScoringComponent)
                .set(req)
                .where(eq(ScoringComponent.id, id))
                .returning();
            const databaseResponse = new DatabaseResponse(true, 200, updatedComponent[0], "Scoring component updated successfully");
            return databaseResponse;
        } catch (error) {
            throw new FailDatabaseResponse("Failed to update scoring component");
        }
    }
}