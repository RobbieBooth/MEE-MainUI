interface Question {
    moduleName: string; // Name of the module
    questionTemplateUUID: string; // UUID for the question template
}

export interface StudentQuestionAttempt extends Question {
    studentQuestionAttemptUUID: string; // UUID for the student question attempt
    flagged: boolean; // Flagged status of the question attempt
}

// Main class definition
export interface StudentQuizAttempt {
    studentQuizAttemptUUID: string; // UUID for the quiz attempt
    quizTemplateUUID: string; // UUID for the quiz template
    quizVersionRef: string; // UUID referencing the quiz version
    createdAt: Date; // Field for storing timestamp
    studentUUID: string; // UUID of the student
    questions: StudentQuestionAttempt[]; // List of student question attempts
}