import { SessionInfo } from "../model/session";

export interface Auth {
    user: User;
}


export interface AuthProps {
    status?: string;
}


export interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}


export interface ResetPasswordProps {
    token: string;
    email: string;
}

export interface ProfileProps  {
    mustVerifyEmail: boolean;
    status?: string;
}

export interface SecurityProps  {
    status?: string;
    sessions?: SessionInfo[];
}


