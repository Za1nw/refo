import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import auth from './auth'
import language from './language'
/**
* @see \Modules\MenuBuilder\Http\Controllers\MenuBuilderController::sidebarMenu
 * @see Modules/MenuBuilder/app/Http/Controllers/MenuBuilderController.php:18
 * @route '/api/v1/sidebar-menu'
 */
export const sidebarMenu = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sidebarMenu.url(options),
    method: 'get',
})

sidebarMenu.definition = {
    methods: ["get","head"],
    url: '/api/v1/sidebar-menu',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\MenuBuilder\Http\Controllers\MenuBuilderController::sidebarMenu
 * @see Modules/MenuBuilder/app/Http/Controllers/MenuBuilderController.php:18
 * @route '/api/v1/sidebar-menu'
 */
sidebarMenu.url = (options?: RouteQueryOptions) => {
    return sidebarMenu.definition.url + queryParams(options)
}

/**
* @see \Modules\MenuBuilder\Http\Controllers\MenuBuilderController::sidebarMenu
 * @see Modules/MenuBuilder/app/Http/Controllers/MenuBuilderController.php:18
 * @route '/api/v1/sidebar-menu'
 */
sidebarMenu.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sidebarMenu.url(options),
    method: 'get',
})
/**
* @see \Modules\MenuBuilder\Http\Controllers\MenuBuilderController::sidebarMenu
 * @see Modules/MenuBuilder/app/Http/Controllers/MenuBuilderController.php:18
 * @route '/api/v1/sidebar-menu'
 */
sidebarMenu.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sidebarMenu.url(options),
    method: 'head',
})

    /**
* @see \Modules\MenuBuilder\Http\Controllers\MenuBuilderController::sidebarMenu
 * @see Modules/MenuBuilder/app/Http/Controllers/MenuBuilderController.php:18
 * @route '/api/v1/sidebar-menu'
 */
    const sidebarMenuForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: sidebarMenu.url(options),
        method: 'get',
    })

            /**
* @see \Modules\MenuBuilder\Http\Controllers\MenuBuilderController::sidebarMenu
 * @see Modules/MenuBuilder/app/Http/Controllers/MenuBuilderController.php:18
 * @route '/api/v1/sidebar-menu'
 */
        sidebarMenuForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sidebarMenu.url(options),
            method: 'get',
        })
            /**
* @see \Modules\MenuBuilder\Http\Controllers\MenuBuilderController::sidebarMenu
 * @see Modules/MenuBuilder/app/Http/Controllers/MenuBuilderController.php:18
 * @route '/api/v1/sidebar-menu'
 */
        sidebarMenuForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sidebarMenu.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    sidebarMenu.form = sidebarMenuForm
const api = {
    auth: Object.assign(auth, auth),
language: Object.assign(language, language),
sidebarMenu: Object.assign(sidebarMenu, sidebarMenu),
}

export default api