import { ClassService } from "src/class/class.service";
import { Class, StudentTakingClassForm } from "src/db/schema";
import { FailDatabaseResponse } from "src/db/response/systemResponse/fail-db.response";

describe("ClassService", () => {
    function createDbMock() {
        const formsFindManyMock = jest.fn();
        const classFindFirstMock = jest.fn();
        const classFindManyMock = jest.fn();
        const insertValuesMock = jest.fn();
        const insertReturningMock = jest.fn();
        const deleteWhereMock = jest.fn();
        const updateSetMock = jest.fn();
        const updateWhereMock = jest.fn();
        const updateReturningMock = jest.fn();

        updateWhereMock.mockReturnValue({ returning: updateReturningMock });
        updateSetMock.mockReturnValue({ where: updateWhereMock });
        insertValuesMock.mockReturnValue({ returning: insertReturningMock });
        deleteWhereMock.mockResolvedValue(undefined);

        const dbMock: any = {
            query: {
                StudentTakingClassForm: {
                    findMany: formsFindManyMock,
                },
                Class: {
                    findFirst: classFindFirstMock,
                    findMany: classFindManyMock,
                },
            },
            update: jest.fn((table: unknown) => {
                if (table !== Class) {
                    throw new Error("Unexpected table for update");
                }

                return {
                    set: updateSetMock,
                };
            }),
            insert: jest.fn(() => ({
                values: insertValuesMock,
            })),
            delete: jest.fn(() => ({
                where: deleteWhereMock,
            })),
        };

        return {
            dbMock,
            mocks: {
                formsFindManyMock,
                classFindFirstMock,
                classFindManyMock,
                insertValuesMock,
                insertReturningMock,
                deleteWhereMock,
                updateSetMock,
                updateWhereMock,
                updateReturningMock,
            },
        };
    }

    it("should reject update when new class capacity is less than existing students", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.formsFindManyMock.mockResolvedValueOnce([
            { id: "f1", classId: "class-1", studentId: "s1" },
            { id: "f2", classId: "class-1", studentId: "s2" },
            { id: "f3", classId: "class-1", studentId: "s3" },
        ]);

        const service = new ClassService(dbMock);

        await expect(service.updateClassInfo("class-1", { classCapacity: 2 })).rejects.toBeInstanceOf(FailDatabaseResponse);
        expect(mocks.updateSetMock).not.toHaveBeenCalled();
    });

    it("should recalculate currentCapacity when classCapacity is updated", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.formsFindManyMock.mockResolvedValueOnce([
            { id: "f1", classId: "class-1", studentId: "s1" },
            { id: "f2", classId: "class-1", studentId: "s2" },
        ]);
        mocks.updateReturningMock.mockResolvedValueOnce([
            {
                id: "class-1",
                classCapacity: 5,
                currentCapacity: 3,
            },
        ]);

        const service = new ClassService(dbMock);

        const result = await service.updateClassInfo("class-1", { classCapacity: 5, name: "Updated" });

        expect(mocks.updateSetMock).toHaveBeenCalledWith(
            expect.objectContaining({
                classCapacity: 5,
                currentCapacity: 3,
                name: "Updated",
            }),
        );
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.message).toBe("Class updated successfully");
        expect(result.data).toMatchObject({ id: "class-1", classCapacity: 5, currentCapacity: 3 });
    });

    it("should keep currentCapacity equal to classCapacity when no students exist", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.formsFindManyMock.mockResolvedValueOnce([]);
        mocks.updateReturningMock.mockResolvedValueOnce([
            {
                id: "class-1",
                classCapacity: 5,
                currentCapacity: 5,
            },
        ]);

        const service = new ClassService(dbMock);

        await service.updateClassInfo("class-1", { classCapacity: 5 });

        expect(mocks.updateSetMock).toHaveBeenCalledWith(
            expect.objectContaining({
                classCapacity: 5,
                currentCapacity: 5,
            }),
        );
    });

    it("should update non-capacity fields without querying student forms", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.updateReturningMock.mockResolvedValueOnce([
            {
                id: "class-1",
                name: "Only name update",
                classCapacity: 10,
                currentCapacity: 6,
            },
        ]);

        const service = new ClassService(dbMock);

        const result = await service.updateClassInfo("class-1", { name: "Only name update" });

        expect(mocks.formsFindManyMock).not.toHaveBeenCalled();
        expect(mocks.updateSetMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Only name update",
            }),
        );
        expect((mocks.updateSetMock.mock.calls[0]?.[0] || {}).currentCapacity).toBeUndefined();
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
    });

    it("should create new class with lecturer name and mirrored current capacity", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.insertReturningMock.mockResolvedValueOnce([
            {
                id: "class-1",
                name: "Pemrograman",
                lecturerName: "lecturer-1",
                classCapacity: 30,
                currentCapacity: 30,
            },
        ]);

        const service = new ClassService(dbMock);

        const result = await service.createNewClass({
            name: "Pemrograman",
            subjectId: "subject-1",
            isHiddenLecturer: false,
            classCapacity: 30,
        }, "lecturer-1");

        expect(mocks.insertValuesMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Pemrograman",
                subjectId: "subject-1",
                lecturerName: "lecturer-1",
                classCapacity: 30,
                currentCapacity: 30,
            }),
        );
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(201);
        expect(result.message).toBe("Class created successfully");
    });

    it("should get class by id with schedules", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.classFindFirstMock.mockResolvedValueOnce({
            id: "class-1",
            name: "Pemrograman",
            schedules: [{ id: "schedule-1" }],
        });

        const service = new ClassService(dbMock);

        const result = await service.getClassById("class-1");

        expect(mocks.classFindFirstMock).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.data).toMatchObject({ id: "class-1", schedules: [{ id: "schedule-1" }] });
    });

    it("should list lecturer own classes", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.classFindManyMock.mockResolvedValueOnce([
            { id: "class-1", lecturerName: "lecturer-1" },
            { id: "class-2", lecturerName: "lecturer-1" },
        ]);

        const service = new ClassService(dbMock);

        const result = await service.lecturerGetOwnClass("lecturer-1");

        expect(mocks.classFindManyMock).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.data).toHaveLength(2);
    });

    it("should get class participants", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.formsFindManyMock.mockResolvedValueOnce([
            { id: "f1", classId: "class-1", student: { id: "student-1" } },
        ]);

        const service = new ClassService(dbMock);

        const result = await service.getClassParticipants("class-1");

        expect(mocks.formsFindManyMock).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.data).toHaveLength(1);
    });

    it("should delete class", async () => {
        const { dbMock, mocks } = createDbMock();
        const service = new ClassService(dbMock);

        const result = await service.deleteClass("class-1");

        expect(mocks.deleteWhereMock).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.message).toBe("Class deleted successfully");
    });

    it("should throw fail response when create class insert fails", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.insertReturningMock.mockRejectedValueOnce(new Error("insert failed"));

        const service = new ClassService(dbMock);

        await expect(service.createNewClass({
            name: "Pemrograman",
            subjectId: "subject-1",
            isHiddenLecturer: false,
            classCapacity: 30,
        }, "lecturer-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should throw fail response when get class by id query fails", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.classFindFirstMock.mockRejectedValueOnce(new Error("read failed"));

        const service = new ClassService(dbMock);

        await expect(service.getClassById("class-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should throw fallback message when get class by id fails without message", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.classFindFirstMock.mockRejectedValueOnce({});

        const service = new ClassService(dbMock);

        await expect(service.getClassById("class-1")).rejects.toMatchObject({
            message: "Failed to retrieve class",
        });
    });

    it("should throw fail response when update class query fails", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.updateReturningMock.mockRejectedValueOnce(new Error("update failed"));

        const service = new ClassService(dbMock);

        await expect(service.updateClassInfo("class-1", { name: "Updated" })).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should throw fail response when delete class query fails", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.deleteWhereMock.mockRejectedValueOnce(new Error("delete failed"));

        const service = new ClassService(dbMock);

        await expect(service.deleteClass("class-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should throw fail response when lecturer own class query fails", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.classFindManyMock.mockRejectedValueOnce(new Error("read failed"));

        const service = new ClassService(dbMock);

        await expect(service.lecturerGetOwnClass("lecturer-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should throw fail response when class participants query fails", async () => {
        const { dbMock, mocks } = createDbMock();
        mocks.formsFindManyMock.mockRejectedValueOnce(new Error("read failed"));

        const service = new ClassService(dbMock);

        await expect(service.getClassParticipants("class-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });
});
