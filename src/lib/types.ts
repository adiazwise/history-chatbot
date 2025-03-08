// types.ts

export interface ResponseModel {
    id:      string;
    type:    string;
    role:    string;
    model:   string;
    content: Content[];
}

export interface Content {
    type: string;
    text: string;
}

export interface ModelResponse {
    event?:       string;
    fromTo?:      string;
    description?: string;
}


type SuccessResult<T> = {
    data: T;
    error: null;
}
type ErrorResult = {
    data: null;
    error: string;
}

export type Result<T> = SuccessResult<T> | ErrorResult;

