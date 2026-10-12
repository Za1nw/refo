import { type ReactNode, useMemo, useState } from 'react';

import FormContext, { type FormData } from '../contexts/form-context';

type FormProviderProps = {
    children: ReactNode;
};

export function FormProvider({ children }: FormProviderProps) {
    const [formData, setFormData] = useState<FormData>({});
    const value = useMemo(() => ({ formData, setFormData }), [formData]);

    return (
        <FormContext.Provider value={value}>{children}</FormContext.Provider>
    );
}

export default FormProvider;
