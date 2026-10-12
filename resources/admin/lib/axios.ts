// resources/js/lib/axios.ts

import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios"

import { toast } from "sonner"

interface ValidationErrors {
    [key: string]: string[]
}

interface ErrorResponse {
    message?: string
    errors?: ValidationErrors
}

declare global {
    interface Window {
        Laravel?: {
            csrfToken?: string | null
            token?: string | null
            baseURL?: string | null
        }
    }
}

const api = axios.create({
    baseURL: window?.Laravel?.baseURL ?? "/",
    withCredentials: true,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
    },
})

// Module-scoped override (يمكن ضبطه برمجياً عبر setAuthToken)
let runtimeAuthToken: string | null = null

// Helper: قراءة CSRF token من نافذة الصفحة إن وُجد
function getCsrfToken(): string | null {
    try {
        return window?.Laravel?.csrfToken ?? null
    } catch (_e) {
        return null
    }
}

// Helper: استرجاع التوكن بأمان - مصادر متعددة: runtime override -> window -> localStorage
function getAuthToken(): string | null {
    if (runtimeAuthToken) return runtimeAuthToken

    try {
        // الأولوية: قيمة موضوعة في نافذة السيرفر (موجودة في resources/views/app.blade.php)
        const fromWindow = window?.Laravel?.token
        if (fromWindow) return fromWindow

        // ثم localStorage كاحتياط
        return localStorage.getItem("token")
    } catch (_e) {
        return null
    }
}

// API: ضبط التوكن برمجياً (مثلاً بعد تسجيل الدخول ديناميكياً)
export function setAuthToken(token: string | null): void {
    runtimeAuthToken = token

    try {
        if (token === null) {
            localStorage.removeItem("token")
        } else {
            localStorage.setItem("token", token)
        }
    } catch (_e) {

    }
}

// Request Interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // تعيين التوكن وCSRF ورؤوس افتراضية للطلبات التي تغير حالة الخادم
        const AUTH_METHODS = ["post", "put", "patch"] as const
        try {
            const method = config.method?.toLowerCase()

            if (method && AUTH_METHODS.includes(method as any)) {
                // CSRF token (من Blade: window.Laravel.csrfToken)
                const csrf = getCsrfToken()
                if (csrf) {
                    config.headers = config.headers || {}
                        ; (config.headers as Record<string, string>)["X-CSRF-TOKEN"] = csrf
                }

                // Authorization Bearer token
                const token = getAuthToken()
                if (token) {
                    config.headers = config.headers || {}
                        ; (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
                }

                // ضمان Content-Type مناسب إذا لم يحدد المستدعي واحداً
                const hasContentType = Boolean(
                    (config.headers as Record<string, any>)?.["Content-Type"] || (config.headers as Record<string, any>)?.["content-type"]
                )

                if (!hasContentType) {
                    config.headers = config.headers || {}
                        ; (config.headers as Record<string, string>)["Content-Type"] = "application/json"
                }
            }
        } catch (e) {
            console.log(e);

        }

        return config
    },

    (error: AxiosError) => {
        return Promise.reject(error)
    }
)

// Response Interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => response,

    (error: AxiosError<ErrorResponse>) => {

        if (error.response) {

            const status = error.response.status

            const message =
                error.response.data?.message ||
                "حدث خطأ غير متوقع"

            switch (status) {

                case 401:
                    toast.error("يجب تسجيل الدخول")
                    break
                case 403:
                    toast.error("ليس لديك صلاحية")
                    break

                case 404:
                    toast.error("الطلب غير موجود")
                    break

                case 422: {

                    const errors = error.response.data?.errors

                    if (errors) {

                        Object.values(errors).forEach((fieldErrors) => {

                            if (fieldErrors.length > 0) {
                                toast.error(fieldErrors[0])
                            }
                        })

                    } else {
                        toast.error("البيانات غير صالحة")
                    }

                    break
                }

                case 500:
                    toast.error("خطأ داخلي في السيرفر")
                    break

                default:
                    toast.error(message)
            }

        } else if (error.request) {

            toast.error("لا يوجد اتصال بالسيرفر")

        } else {

            toast.error(error.message)
        }

        return Promise.reject(error)
    }
)

export default api
