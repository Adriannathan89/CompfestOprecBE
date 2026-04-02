export type ClassParticipantResponse = {
    id: string;
    classId: string;
    studentId: string;
    student: {
        username: string;
    }
    class? : {
        name: string;
    }
    takingPosition: number;
    isFinalized: boolean;
    createdAt: Date;
}