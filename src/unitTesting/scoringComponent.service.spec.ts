import { ScoringComponentService } from "src/scoringComponent/scoringComponent.service";
import { ScoringComponent } from "src/db/schema/scoringComponent.schema";
import { FailDatabaseResponse } from "src/db/response/systemResponse/fail-db.response";

describe("ScoringComponentService", () => {
    function createDbMock() {
        const insertValuesMock = jest.fn();
        const insertReturningMock = jest.fn();
        const queryFindManyMock = jest.fn();
        const deleteWhereMock = jest.fn();
        const updateSetMock = jest.fn();
        const updateWhereMock = jest.fn();
        const updateReturningMock = jest.fn();

        insertValuesMock.mockReturnValue({ returning: insertReturningMock });
        updateWhereMock.mockReturnValue({ returning: updateReturningMock });
        updateSetMock.mockReturnValue({ where: updateWhereMock });
        deleteWhereMock.mockResolvedValue(undefined);

        const dbMock: any = {
            query: {
                ScoringComponent: {
                    findMany: queryFindManyMock,
                },
            },
            insert: jest.fn((table: unknown) => {
                if (table !== ScoringComponent) {
                    throw new Error("Unexpected table for insert");
                }

                return {
                    values: insertValuesMock,
                };
            }),
            delete: jest.fn((table: unknown) => {
                if (table !== ScoringComponent) {
                    throw new Error("Unexpected table for delete");
                }

                return {
                    where: deleteWhereMock,
                };
            }),
            update: jest.fn((table: unknown) => {
                if (table !== ScoringComponent) {
                    throw new Error("Unexpected table for update");
                }

                return {
                    set: updateSetMock,
                };
            }),
        };

        return {
            dbMock,
            mocks: {
                insertValuesMock,
                insertReturningMock,
                queryFindManyMock,
                deleteWhereMock,
                updateSetMock,
                updateWhereMock,
                updateReturningMock,
            },
        };
    }

    it("should create scoring component", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.insertReturningMock.mockResolvedValueOnce([
            {
                id: "component-1",
                classId: "class-1",
                name: "UTS",
                weight: 30,
            },
        ]);

        const service = new ScoringComponentService(dbMock);

        const result = await service.createScoringComponent({
            classId: "class-1",
            name: "UTS",
            weight: 30,
        });

        expect(mocks.insertValuesMock).toHaveBeenCalledWith(
            expect.objectContaining({
                classId: "class-1",
                name: "UTS",
                weight: 30,
            }),
        );
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(201);
        expect(result.message).toBe("Scoring component created successfully");
    });

    it("should get scoring components by class id", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.queryFindManyMock.mockResolvedValueOnce([
            { id: "component-1", classId: "class-1", name: "UTS", weight: 30 },
            { id: "component-2", classId: "class-1", name: "UAS", weight: 40 },
        ]);

        const service = new ScoringComponentService(dbMock);

        const result = await service.getScoringComponentsByClassId("class-1");

        expect(mocks.queryFindManyMock).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.data).toHaveLength(2);
    });

    it("should update scoring component", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.updateReturningMock.mockResolvedValueOnce([
            { id: "component-1", classId: "class-1", name: "UTS Updated", weight: 35 },
        ]);

        const service = new ScoringComponentService(dbMock);

        const result = await service.updateScoringComponent("component-1", {
            name: "UTS Updated",
            weight: 35,
        });

        expect(mocks.updateSetMock).toHaveBeenCalledWith({ name: "UTS Updated", weight: 35 });
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.data).toMatchObject({ id: "component-1", weight: 35 });
    });

    it("should delete scoring component", async () => {
        const { dbMock, mocks } = createDbMock();

        const service = new ScoringComponentService(dbMock);

        const result = await service.deleteScoringComponent("component-1");

        expect(mocks.deleteWhereMock).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.data).toBeNull();
    });

    it("should throw fail response when database query fails", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.queryFindManyMock.mockRejectedValueOnce(new Error("db error"));

        const service = new ScoringComponentService(dbMock);

        await expect(service.getScoringComponentsByClassId("class-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });
});
