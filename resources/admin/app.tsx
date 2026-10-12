import { createInertiaApp, router } from '@inertiajs/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import { clearSidebarMenuCache } from '@menubuilder/lib/sidebar-menu'

import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { ConfirmInDiv } from './components/custom/ConfirmDialog'
import { DirectionProvider } from './components/ui/direction'
import { Toaster } from './components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { initializeTheme } from './hooks/use-appearance'
import { initI18n, Translations } from './i18n'
import AppLayout from './layouts/app-layout'
import AuthLayout from './layouts/auth-layout'
import SettingsLayout from './layouts/settings/layout'
import capitalizeFirst from './lib/stringFormatting'
import { fetchSidebarMenu } from './slices/sidebarMenuSlice'
import { store } from './store/store'

const appName = import.meta.env.VITE_APP_NAME || 'Laravel'

let inertiaI18nListenerRegistered = false


const localPages = import.meta.glob('./pages/**/*.tsx')
const modulePages = import.meta.glob(
    '../../Modules/*/resources/assets/admin/pages/**/*.tsx'
)

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),

    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null
            case name.startsWith('auth/'):
                return AuthLayout
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout]
            default:
                return AppLayout
        }
    },

    resolve: (name: string) => {
        const pages = { ...localPages, ...modulePages }

        const regex = /([^:]+)::(.+)/
        const matches = regex.exec(name)

        let key: string

        if (matches && matches.length > 2) {
            const module = matches[1].replace(
                /[A-Z]/g,
                (m, offset) =>
                    (offset > 0 ? '-' : '') + m.toLowerCase()
            )

            const pageName = matches[2]

            key = `../../Modules/${capitalizeFirst(module)}/resources/assets/admin/pages/${pageName}.tsx`
        } else {
            key = `./pages/${name}.tsx`
        }

        return resolvePageComponent(key, pages).then((m: any) => m.default)
    },

    setup({ el, App, props }) {
        const root = createRoot(el)

        const pageProps = props.initialPage.props as Record<string, unknown>
        const translations = pageProps.translations as Translations | undefined

        void initI18n(translations)

        if (!inertiaI18nListenerRegistered) {
            inertiaI18nListenerRegistered = true

            router.on('success', (event) => {
                const nextProps = (
                    event as {
                        detail: { page: { props: Record<string, unknown> } }
                    }
                ).detail.page.props

                const nextTranslations = nextProps.translations as
                    | Translations
                    | undefined

                void initI18n(nextTranslations)

                const nextUrl = (event as { detail: { page: { url: string } } })
                    .detail.page.url

                if (nextUrl.startsWith('/menubuilders')) {
                    clearSidebarMenuCache()
                    void store.dispatch(fetchSidebarMenu({ force: true }))
                }
            })
        }

        const direction = pageProps.direction as 'ltr' | 'rtl' | undefined

        root.render(
            <StrictMode>
                <Provider store={store}>
                    <DirectionProvider
                        direction={direction}
                        dir={direction || 'rtl'}
                    >
                        <TooltipProvider>
                            <Toaster
                                visibleToasts={4}
                                position="top-center"
                                duration={5000}
                            />
                            <App {...props} />
                            <ConfirmInDiv />
                        </TooltipProvider>
                    </DirectionProvider>
                </Provider>
            </StrictMode>
        )
    },

    progress: {
        color: 'var(--primary)',
    },
})

// theme init
initializeTheme()
