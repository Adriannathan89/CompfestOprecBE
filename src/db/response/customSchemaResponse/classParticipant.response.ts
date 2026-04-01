export type ClassParticipantResponse = {
    id: string;
    classId: string;
    studentId: string;
    student: {
        username: string;
    }
    takingPosition: number;
    isFinalized: boolean;
    createdAt: Date;
}