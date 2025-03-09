export interface EventDetails {
    genericEvent: GenericEvent;
    quizUUID: string; // UUID represented as a string
    questionUUID: string | null; // UUID or null
    nextQuestionUUID?: string;
    // studentUUID: string | null;
    additionalData: Record<string, any>; // Arbitrary data storage
}

export enum QuestionClientSideEvent {
    SAVE_QUESTION = "SAVE_QUESTION",
    SUBMIT_QUESTION = "SUBMIT_QUESTION",
}

class GenericEvent {

}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export enum QuizClientSideEvents {
    SAVE_QUIZ = "SAVE_QUIZ",
    OPEN_QUIZ = "OPEN_QUIZ",
    START_QUIZ = "START_QUIZ",
    CLOSE_QUIZ = "CLOSE_QUIZ",
    SUBMIT_QUIZ = "SUBMIT_QUIZ",
    MOVE_QUESTION = "MOVE_QUESTION",
}

/**
 * Creates a Move question event - moving from the current question to the question specified with nextQuestionUUID.
 *
 * @param quizAttemptID the student quiz attempt id of this quiz
 * @param currentQuestionUUID The current question the user is one
 * @param nextQuestionUUID The question the user wishes to move to
 * @param quizData a record of all the quiz questions uuids to their additional data
 */
export function createMoveQuestionEvent(quizAttemptID:string, currentQuestionUUID:string, nextQuestionUUID:string, quizData:Record<string, Record<string, any>>):EventDetails {
    return {
        genericEvent: {
            type: "QuizEvent",
            event: QuizClientSideEvents.MOVE_QUESTION
        },
        quizUUID: quizAttemptID,
        questionUUID: currentQuestionUUID,
        nextQuestionUUID: nextQuestionUUID,
        additionalData: quizData
    };
}

/**
 * Creates a Quiz event
 *
 * @param eventType the type of quiz event
 * @param quizAttemptID the student quiz attempt id of this quiz
 * @param currentQuestionUUID We do not need a question uuid as this event is a quiz unless we are stating we are on that question
 * @param quizData a record of all the quiz questions uuids to their additional data
 */
export function createQuizEvent(eventType:QuizClientSideEvents, quizAttemptID:string, currentQuestionUUID:string | null,  quizData:Record<string, Record<string, any>>):EventDetails {
    return {
        genericEvent: {
            type: "QuizEvent",
            event: eventType
        },
        quizUUID: quizAttemptID,
        questionUUID: currentQuestionUUID, //we do not need a question uuid as this event is a quiz unless we are stating we are on that question
        additionalData: quizData
    };
}

/**
 * Creates a Question event
 *
 * @param eventType the type of question event
 * @param quizAttemptID the student quiz attempt id of this question
 * @param questionAttemptID
 * @param questionData a record of the questions data
 */
export function createQuestionEvent(eventType:QuestionClientSideEvent, quizAttemptID:string, questionAttemptID:string, questionData:Record<string, any>):EventDetails {
    return {
        genericEvent: {
            type: "QuestionEvent",
            event: eventType
        },
        quizUUID: quizAttemptID,
        questionUUID:questionAttemptID,
        additionalData: questionData
    };
}

export function createToggleFlagEvent(questionAttemptUUID:string, quizAttemptID:string, additionalData:Record<string, any>):EventDetails {
    return {
        genericEvent: {
            type: "QuestionEvent",
            event: "TOGGLE_FLAG"
        },
        quizUUID: quizAttemptID,
        questionUUID: questionAttemptUUID,
        additionalData: additionalData
    }
}

