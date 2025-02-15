interface EventDetails {
    genericEvent: GenericEvent;
    quizUUID: string; // UUID represented as a string
    questionUUID: string | null; // UUID or null
    // studentUUID: string | null;
    additionalData: Record<string, any>; // Arbitrary data storage
}

enum QuestionClientSideEvent {
    SAVE_QUESTION = "SAVE_QUESTION",
    SUBMIT_QUESTION = "SUBMIT_QUESTION",
}

class GenericEvent {

}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum QuizClientSideEvents {
    SAVE_QUIZ = "SAVE_QUIZ",
    OPEN_QUIZ = "OPEN_QUIZ",
    START_QUIZ = "START_QUIZ",
    CLOSE_QUIZ = "CLOSE_QUIZ",
    SUBMIT_QUIZ = "SUBMIT_QUIZ",
    MOVE_QUESTION = "MOVE_QUESTION",
}
