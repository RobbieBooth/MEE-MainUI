export interface QuestionIFrameReturnType {
    questionID: string;
    additionalData: Record<string, any>;
}

/**
 * Convert the payload from the IFrame question into data which can be process and returned to the spring server.
 * The payload must contain `questionID` and `additionalData` or error is thrown.
 * @param payload Must contain `questionID` and `additionalData` or error is thrown.
 */
export const validateAndConvertPayload = (payload: string): QuestionIFrameReturnType => {
    try {
        const parsedPayload = JSON.parse(payload);

        //Check if the parsed object has the required properties and correct types
        if(typeof parsedPayload !== "object" || parsedPayload === null){
            throw new Error("Payload must be an object and defined");
        }

        // Ensure required properties exist and have the correct types
        if (typeof parsedPayload.questionID !== "string") {
            throw new Error("Invalid payload: 'questionID' must be a string.");
        }

        if (
            typeof parsedPayload.additionalData !== "object" ||
            parsedPayload.additionalData === null ||
            Array.isArray(parsedPayload.additionalData)
        ) {
            throw new Error("Invalid payload: 'additionalData' must be an object of string to any.");
        }


        return parsedPayload as QuestionIFrameReturnType; // Type assertion (safe since we've validated it)
    } catch (error) {
        throw new Error(`Invalid payload: ${(error as Error).message}`);
    }
};