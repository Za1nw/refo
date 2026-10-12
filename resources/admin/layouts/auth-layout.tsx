import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import AuthCardLayout from './auth/auth-card-layout';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <AuthCardLayout title={title} description={description}>
            {children}
        </AuthCardLayout>
    );
}
