export type ErrorCode =
    | "duplicateCampusID"
    | "missingCampusID"
    | "resourceNotFound"
    | "duplicateTitle"
    | "resourceClosed"
    | "validationError"
    | "unknown"
    | "system";

export class MyError extends Error {

    public readonly details: {
        code: ErrorCode;
        path?: string;
        value?: any;
    };

    constructor(message: string, details: { code: ErrorCode; path?: string; value?: any }) {
        super(message);
        this.details = details;
        Object.setPrototypeOf(this, MyError.prototype);
    }
}