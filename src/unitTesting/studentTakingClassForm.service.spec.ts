import { StudentTakingClassFormGetterService } from "src/studentTakingClassForm/studentTakingClassFormGetter.service";
import { StudentTakingClassFormUpdaterService } from "src/studentTakingClassForm/studentTakingClassFormUpdater.service";
import { Class, StudentTakingClassForm, Users } from "src/db/schema";
import { FailDatabaseResponse } from "src/db/response/systemResponse/fail-db.response";

type State = {
    classRecord: {
        id: string;
        classCapacity: number;
        currentCapacity: number;
        subject: { sks: number };
    };
    userRecord: {
        id: string;
        currentSKS: number;
    };
    forms: Array<{
        id: string;
        studentId: string;
        classId: string;
        takingPosition: number;
        isFinalized: boolean;
    }>;
};

function createDbMock(initialState: State) {
    const state: State = {
        classRecord: { ...initialState.classRecord, subject: { ...initialState.classRecord.subject } },
        userRecord: { ...initialState.userRecord },
        forms: [...initialState.forms],
    };

    const updateClassReturningMock = jest.fn(async () => {
        await Promise.resolve();

        if (state.classRecord.currentCapacity <= 0) {
            return [];
        }

        state.classRecord.currentCapacity -= 1;
        return [
            {
                id: state.classRecord.id,
                classCapacity: state.classRecord.classCapacity,
                currentCapacity: state.classRecord.currentCapacity,
            },
        ];
    });

    const updateUsersWhereMock = jest.fn(async () => []);
    const insertReturningMock = jest.fn(async () => {
        const form = {
            id: `form-${state.forms.length + 1}`,
            studentId: state.userRecord.id,
            classId: state.classRecord.id,
            takingPosition: state.classRecord.classCapacity - state.classRecord.currentCapacity,
            isFinalized: false,
        };
        state.forms.push(form);
        return [form];
    });

    const dbMock: any = {
        query: {
            Class: {
                findFirst: jest.fn(async () => ({
                    id: state.classRecord.id,
                    classCapacity: state.classRecord.classCapacity,
                    currentCapacity: state.classRecord.currentCapacity,
                    subject: { sks: state.classRecord.subject.sks },
                })),
            },
            Users: {
                findFirst: jest.fn(async () => ({
                    id: state.userRecord.id,
                    currentSKS: state.userRecord.currentSKS,
                })),
            },
        },
        update: jest.fn((table: unknown) => {
            if (table === Class) {
                return {
                    set: jest.fn(() => ({
                        where: jest.fn(() => ({ returning: updateClassReturningMock })),
                    })),
                };
            }

            if (table === Users) {
                return {
                    set: jest.fn((payload: { currentSKS: number }) => {
                        state.userRecord.currentSKS = payload.currentSKS;
                        return {
                            where: updateUsersWhereMock,
                        };
                    }),
                };
            }

            throw new Error("Unexpected table for update");
        }),
        insert: jest.fn((table: unknown) => {
            if (table !== StudentTakingClassForm) {
                throw new Error("Unexpected table for insert");
            }

            return {
                values: jest.fn(() => ({
                    returning: insertReturningMock,
                })),
            };
        }),
        delete: jest.fn((table: unknown) => {
            if (table !== StudentTakingClassForm) {
                throw new Error("Unexpected table for delete");
            }

            return {
                where: jest.fn((_: unknown) => ({
                    returning: jest.fn(async () => {
                        if (state.forms.length === 0) {
                            return [];
                        }
                        const [deleted] = state.forms.splice(0, 1);
                        return [deleted];
                    }),
                })),
            };
        }),
    };

    return {
        dbMock,
        state,
        mocks: {
            updateClassReturningMock,
            updateUsersWhereMock,
            insertReturningMock,
        },
    };
}

describe("StudentTakingClassFormService", () => {
    it("should create student taking class form successfully", async () => {
        const { dbMock, state, mocks } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 3,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 18,
            },
            forms: [],
        });

        const service = new StudentTakingClassFormUpdaterService(dbMock);

        const result = await service.createStudentTakingClassForm("user-1", "class-1");

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(201);
        expect(result.message).toBe("Successfully enrolled in class");
        expect(state.classRecord.currentCapacity).toBe(2);
        expect(state.userRecord.currentSKS).toBe(21);
        expect(state.forms).toHaveLength(1);
        expect(mocks.updateClassReturningMock).toHaveBeenCalledTimes(1);
        expect(mocks.insertReturningMock).toHaveBeenCalledTimes(1);
        expect(mocks.updateUsersWhereMock).toHaveBeenCalledTimes(1);
    });

    it("should throw when class is full", async () => {
        const { dbMock, state } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 1,
                currentCapacity: 0,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 18,
            },
            forms: [],
        });

        const service = new StudentTakingClassFormUpdaterService(dbMock);

        await expect(service.createStudentTakingClassForm("user-1", "class-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
        expect(state.forms).toHaveLength(0);
        const classUpdateCalls = dbMock.update.mock.calls.filter((call: unknown[]) => call[0] === Class);
        expect(classUpdateCalls).toHaveLength(1);
    });

    it("should throw when SKS limit is exceeded", async () => {
        const { dbMock, state, mocks } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 3,
                subject: { sks: 4 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 22,
            },
            forms: [],
        });

        const service = new StudentTakingClassFormUpdaterService(dbMock);

        await expect(service.createStudentTakingClassForm("user-1", "class-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
        expect(mocks.insertReturningMock).not.toHaveBeenCalled();
        expect(state.forms).toHaveLength(0);
        const classUpdateCalls = dbMock.update.mock.calls.filter((call: unknown[]) => call[0] === Class);
        expect(classUpdateCalls).toHaveLength(2);
    });

    it("should handle race condition: only one create succeeds when one seat is left", async () => {
        const { dbMock, state, mocks } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 1,
                currentCapacity: 1,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 10,
            },
            forms: [],
        });

        const service = new StudentTakingClassFormUpdaterService(dbMock);

        const [first, second] = await Promise.allSettled([
            service.createStudentTakingClassForm("user-1", "class-1"),
            service.createStudentTakingClassForm("user-1", "class-1"),
        ]);

        const fulfilled = [first, second].filter((item) => item.status === "fulfilled");
        const rejected = [first, second].filter((item) => item.status === "rejected");

        expect(fulfilled).toHaveLength(1);
        expect(rejected).toHaveLength(1);
        expect(state.forms).toHaveLength(1);
        expect(state.classRecord.currentCapacity).toBe(0);
        expect(state.userRecord.currentSKS).toBe(13);
        expect(mocks.updateClassReturningMock).toHaveBeenCalledTimes(2);
        expect(mocks.insertReturningMock).toHaveBeenCalledTimes(1);
        expect(mocks.updateUsersWhereMock).toHaveBeenCalledTimes(1);
    });

    it("should delete student taking class form successfully", async () => {
        const { dbMock, state } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 2,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 21,
            },
            forms: [
                {
                    id: "form-1",
                    studentId: "user-1",
                    classId: "class-1",
                    takingPosition: 1,
                    isFinalized: false,
                },
            ],
        });

        const service = new StudentTakingClassFormUpdaterService(dbMock);

        const result = await service.deleteStudentTakingClassForm("class-1", "user-1");

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(state.forms).toHaveLength(0);
    });

    it("should get student taking class forms by student id", async () => {
        const { dbMock } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 2,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 18,
            },
            forms: [
                {
                    id: "form-1",
                    studentId: "user-1",
                    classId: "class-1",
                    takingPosition: 1,
                    isFinalized: false,
                },
            ],
        });

        dbMock.query.StudentTakingClassForm = {
            findMany: jest.fn(async () => [
                {
                    id: "form-1",
                    studentId: "user-1",
                    classId: "class-1",
                    takingPosition: 1,
                    isFinalized: false,
                    class: {
                        id: "class-1",
                        name: "A",
                        subject: { sks: 3 },
                    },
                },
            ]),
        };

        const service = new StudentTakingClassFormGetterService(dbMock);

        const result = await service.getStudentTakingClassFormsByStudentId("user-1");

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.message).toBe("Successfully retrieved student taking class forms");
        expect(result.data).toHaveLength(1);
    });

    it("should get student taking class form by id", async () => {
        const { dbMock } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 2,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 18,
            },
            forms: [],
        });

        const createdAt = new Date("2026-04-01T00:00:00.000Z");
        dbMock.query.StudentTakingClassForm = {
            findFirst: jest.fn(async () => ({
                id: "form-1",
                studentId: "user-1",
                classId: "class-1",
                takingPosition: 1,
                isFinalized: false,
                createdAt,
                student: {
                    username: "student1",
                },
            })),
        };

        const service = new StudentTakingClassFormGetterService(dbMock);

        const result = await service.getStudentTakingClassFormById("form-1");

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.message).toBe("Successfully retrieved student taking class form");
        expect(result.data).toMatchObject({
            id: "form-1",
            studentId: "user-1",
            classId: "class-1",
            takingPosition: 1,
            isFinalized: false,
            student: {
                username: "student1",
            },
        });
    });

    it("should throw when student taking class form by id is not found", async () => {
        const { dbMock } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 2,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 18,
            },
            forms: [],
        });

        dbMock.query.StudentTakingClassForm = {
            findFirst: jest.fn(async () => null),
        };

        const service = new StudentTakingClassFormGetterService(dbMock);

        await expect(service.getStudentTakingClassFormById("form-1")).rejects.toMatchObject({
            message: "Student taking class form not found",
        });
    });

    it("should throw fallback message when get by id fails without message", async () => {
        const { dbMock } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 2,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 18,
            },
            forms: [],
        });

        dbMock.query.StudentTakingClassForm = {
            findFirst: jest.fn(async () => {
                throw {};
            }),
        };

        const service = new StudentTakingClassFormGetterService(dbMock);

        await expect(service.getStudentTakingClassFormById("form-1")).rejects.toMatchObject({
            message: "Failed to retrieve student taking class form",
        });
    });

    it("should throw when class or student is not found during create", async () => {
        const { dbMock } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 3,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 18,
            },
            forms: [],
        });

        dbMock.query.Class.findFirst.mockResolvedValueOnce(null);

        const service = new StudentTakingClassFormUpdaterService(dbMock);

        await expect(service.createStudentTakingClassForm("user-1", "class-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should throw when get forms query fails", async () => {
        const { dbMock } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 2,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 18,
            },
            forms: [],
        });

        dbMock.query.StudentTakingClassForm = {
            findMany: jest.fn(async () => {
                throw new Error("query failed");
            }),
        };

        const service = new StudentTakingClassFormGetterService(dbMock);

        await expect(service.getStudentTakingClassFormsByStudentId("user-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should throw fallback message when get forms fails without message", async () => {
        const { dbMock } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 2,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 18,
            },
            forms: [],
        });

        dbMock.query.StudentTakingClassForm = {
            findMany: jest.fn(async () => {
                throw {};
            }),
        };

        const service = new StudentTakingClassFormGetterService(dbMock);

        await expect(service.getStudentTakingClassFormsByStudentId("user-1")).rejects.toMatchObject({
            message: "Failed to retrieve student taking class forms",
        });
    });

    it("should throw when deleting non-existing student taking class form", async () => {
        const { dbMock } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 2,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 21,
            },
            forms: [],
        });

        const service = new StudentTakingClassFormUpdaterService(dbMock);

        await expect(service.deleteStudentTakingClassForm("class-1", "user-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });

    it("should throw when class or student is not found during delete", async () => {
        const { dbMock } = createDbMock({
            classRecord: {
                id: "class-1",
                classCapacity: 3,
                currentCapacity: 2,
                subject: { sks: 3 },
            },
            userRecord: {
                id: "user-1",
                currentSKS: 21,
            },
            forms: [
                {
                    id: "form-1",
                    studentId: "user-1",
                    classId: "class-1",
                    takingPosition: 1,
                    isFinalized: false,
                },
            ],
        });

        dbMock.query.Users.findFirst.mockResolvedValueOnce(null);

        const service = new StudentTakingClassFormUpdaterService(dbMock);

        await expect(service.deleteStudentTakingClassForm("class-1", "user-1")).rejects.toBeInstanceOf(FailDatabaseResponse);
    });
});
