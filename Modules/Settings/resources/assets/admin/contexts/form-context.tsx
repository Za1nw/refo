import {
    createContext,
    useContext,
    type Dispatch,
    type SetStateAction,
} from 'react';

export type FormData = Record<string, unknown>;

export type FormContextType = {
    formData: FormData;
    setFormData: Dispatch<SetStateAction<FormData>>;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function useFormContext(): FormContextType {
    const context = useContext(FormContext);

    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }

    return context;
}

export default FormContext;
