import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/api/v1/languages'
 */
const indexff7cccbd6bdcc38cd048649a90511186 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexff7cccbd6bdcc38cd048649a90511186.url(options),
    method: 'get',
})

indexff7cccbd6bdcc38cd048649a90511186.definition = {
    methods: ["get","head"],
    url: '/api/v1/languages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/api/v1/languages'
 */
indexff7cccbd6bdcc38cd048649a90511186.url = (options?: RouteQueryOptions) => {
    return indexff7cccbd6bdcc38cd048649a90511186.definition.url + queryParams(options)
}

/**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/api/v1/languages'
 */
indexff7cccbd6bdcc38cd048649a90511186.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexff7cccbd6bdcc38cd048649a90511186.url(options),
    method: 'get',
})
/**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/api/v1/languages'
 */
indexff7cccbd6bdcc38cd048649a90511186.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexff7cccbd6bdcc38cd048649a90511186.url(options),
    method: 'head',
})

    /**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/api/v1/languages'
 */
    const indexff7cccbd6bdcc38cd048649a90511186Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexff7cccbd6bdcc38cd048649a90511186.url(options),
        method: 'get',
    })

            /**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/api/v1/languages'
 */
        indexff7cccbd6bdcc38cd048649a90511186Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexff7cccbd6bdcc38cd048649a90511186.url(options),
            method: 'get',
        })
            /**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/api/v1/languages'
 */
        indexff7cccbd6bdcc38cd048649a90511186Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexff7cccbd6bdcc38cd048649a90511186.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexff7cccbd6bdcc38cd048649a90511186.form = indexff7cccbd6bdcc38cd048649a90511186Form
    /**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/admin/hidden/languages'
 */
const indexe57effe97d36a1666c56fa5fb3fadd4c = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexe57effe97d36a1666c56fa5fb3fadd4c.url(options),
    method: 'get',
})

indexe57effe97d36a1666c56fa5fb3fadd4c.definition = {
    methods: ["get","head"],
    url: '/admin/hidden/languages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/admin/hidden/languages'
 */
indexe57effe97d36a1666c56fa5fb3fadd4c.url = (options?: RouteQueryOptions) => {
    return indexe57effe97d36a1666c56fa5fb3fadd4c.definition.url + queryParams(options)
}

/**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/admin/hidden/languages'
 */
indexe57effe97d36a1666c56fa5fb3fadd4c.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexe57effe97d36a1666c56fa5fb3fadd4c.url(options),
    method: 'get',
})
/**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/admin/hidden/languages'
 */
indexe57effe97d36a1666c56fa5fb3fadd4c.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexe57effe97d36a1666c56fa5fb3fadd4c.url(options),
    method: 'head',
})

    /**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/admin/hidden/languages'
 */
    const indexe57effe97d36a1666c56fa5fb3fadd4cForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexe57effe97d36a1666c56fa5fb3fadd4c.url(options),
        method: 'get',
    })

            /**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/admin/hidden/languages'
 */
        indexe57effe97d36a1666c56fa5fb3fadd4cForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexe57effe97d36a1666c56fa5fb3fadd4c.url(options),
            method: 'get',
        })
            /**
* @see \Modules\Language\Http\Controllers\LanguageController::index
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:46
 * @route '/admin/hidden/languages'
 */
        indexe57effe97d36a1666c56fa5fb3fadd4cForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexe57effe97d36a1666c56fa5fb3fadd4c.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexe57effe97d36a1666c56fa5fb3fadd4c.form = indexe57effe97d36a1666c56fa5fb3fadd4cForm

/**
* Multiple routes resolve to \Modules\Language\Http\Controllers\LanguageController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/v1/languages': indexff7cccbd6bdcc38cd048649a90511186,
    '/admin/hidden/languages': indexe57effe97d36a1666c56fa5fb3fadd4c,
}

/**
* @see \Modules\Language\Http\Controllers\LanguageController::store
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:89
 * @route '/api/v1/languages'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/languages',
} satisfies RouteDefinition<["post"]>

/**
* @see \Modules\Language\Http\Controllers\LanguageController::store
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:89
 * @route '/api/v1/languages'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Modules\Language\Http\Controllers\LanguageController::store
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:89
 * @route '/api/v1/languages'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Modules\Language\Http\Controllers\LanguageController::store
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:89
 * @route '/api/v1/languages'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Modules\Language\Http\Controllers\LanguageController::store
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:89
 * @route '/api/v1/languages'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \Modules\Language\Http\Controllers\LanguageController::show
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:97
 * @route '/api/v1/languages/{language}'
 */
export const show = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/languages/{language}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Language\Http\Controllers\LanguageController::show
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:97
 * @route '/api/v1/languages/{language}'
 */
show.url = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { language: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    language: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        language: args.language,
                }

    return show.definition.url
            .replace('{language}', parsedArgs.language.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Language\Http\Controllers\LanguageController::show
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:97
 * @route '/api/v1/languages/{language}'
 */
show.get = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Language\Http\Controllers\LanguageController::show
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:97
 * @route '/api/v1/languages/{language}'
 */
show.head = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Language\Http\Controllers\LanguageController::show
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:97
 * @route '/api/v1/languages/{language}'
 */
    const showForm = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Language\Http\Controllers\LanguageController::show
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:97
 * @route '/api/v1/languages/{language}'
 */
        showForm.get = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Language\Http\Controllers\LanguageController::show
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:97
 * @route '/api/v1/languages/{language}'
 */
        showForm.head = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \Modules\Language\Http\Controllers\LanguageController::update
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:119
 * @route '/api/v1/languages/{language}'
 */
const update96817da1971eeb49e4f1147aa6345e61 = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update96817da1971eeb49e4f1147aa6345e61.url(args, options),
    method: 'put',
})

update96817da1971eeb49e4f1147aa6345e61.definition = {
    methods: ["put","patch"],
    url: '/api/v1/languages/{language}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \Modules\Language\Http\Controllers\LanguageController::update
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:119
 * @route '/api/v1/languages/{language}'
 */
update96817da1971eeb49e4f1147aa6345e61.url = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { language: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    language: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        language: args.language,
                }

    return update96817da1971eeb49e4f1147aa6345e61.definition.url
            .replace('{language}', parsedArgs.language.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Language\Http\Controllers\LanguageController::update
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:119
 * @route '/api/v1/languages/{language}'
 */
update96817da1971eeb49e4f1147aa6345e61.put = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update96817da1971eeb49e4f1147aa6345e61.url(args, options),
    method: 'put',
})
/**
* @see \Modules\Language\Http\Controllers\LanguageController::update
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:119
 * @route '/api/v1/languages/{language}'
 */
update96817da1971eeb49e4f1147aa6345e61.patch = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update96817da1971eeb49e4f1147aa6345e61.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\Language\Http\Controllers\LanguageController::update
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:119
 * @route '/api/v1/languages/{language}'
 */
    const update96817da1971eeb49e4f1147aa6345e61Form = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update96817da1971eeb49e4f1147aa6345e61.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Language\Http\Controllers\LanguageController::update
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:119
 * @route '/api/v1/languages/{language}'
 */
        update96817da1971eeb49e4f1147aa6345e61Form.put = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update96817da1971eeb49e4f1147aa6345e61.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Modules\Language\Http\Controllers\LanguageController::update
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:119
 * @route '/api/v1/languages/{language}'
 */
        update96817da1971eeb49e4f1147aa6345e61Form.patch = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update96817da1971eeb49e4f1147aa6345e61.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update96817da1971eeb49e4f1147aa6345e61.form = update96817da1971eeb49e4f1147aa6345e61Form
    /**
* @see \Modules\Language\Http\Controllers\LanguageController::update
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:119
 * @route '/admin/hidden/languages/{namespace}/{group}'
 */
const updated94a8e2ae446d7631413baa85b6c2a4b = (args: { namespace: string | number, group: string | number } | [namespace: string | number, group: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updated94a8e2ae446d7631413baa85b6c2a4b.url(args, options),
    method: 'patch',
})

updated94a8e2ae446d7631413baa85b6c2a4b.definition = {
    methods: ["patch"],
    url: '/admin/hidden/languages/{namespace}/{group}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \Modules\Language\Http\Controllers\LanguageController::update
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:119
 * @route '/admin/hidden/languages/{namespace}/{group}'
 */
updated94a8e2ae446d7631413baa85b6c2a4b.url = (args: { namespace: string | number, group: string | number } | [namespace: string | number, group: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    namespace: args[0],
                    group: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        namespace: args.namespace,
                                group: args.group,
                }

    return updated94a8e2ae446d7631413baa85b6c2a4b.definition.url
            .replace('{namespace}', parsedArgs.namespace.toString())
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Language\Http\Controllers\LanguageController::update
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:119
 * @route '/admin/hidden/languages/{namespace}/{group}'
 */
updated94a8e2ae446d7631413baa85b6c2a4b.patch = (args: { namespace: string | number, group: string | number } | [namespace: string | number, group: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updated94a8e2ae446d7631413baa85b6c2a4b.url(args, options),
    method: 'patch',
})

    /**
* @see \Modules\Language\Http\Controllers\LanguageController::update
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:119
 * @route '/admin/hidden/languages/{namespace}/{group}'
 */
    const updated94a8e2ae446d7631413baa85b6c2a4bForm = (args: { namespace: string | number, group: string | number } | [namespace: string | number, group: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updated94a8e2ae446d7631413baa85b6c2a4b.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Language\Http\Controllers\LanguageController::update
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:119
 * @route '/admin/hidden/languages/{namespace}/{group}'
 */
        updated94a8e2ae446d7631413baa85b6c2a4bForm.patch = (args: { namespace: string | number, group: string | number } | [namespace: string | number, group: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updated94a8e2ae446d7631413baa85b6c2a4b.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updated94a8e2ae446d7631413baa85b6c2a4b.form = updated94a8e2ae446d7631413baa85b6c2a4bForm

/**
* Multiple routes resolve to \Modules\Language\Http\Controllers\LanguageController::update, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `update['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const update = {
    '/api/v1/languages/{language}': update96817da1971eeb49e4f1147aa6345e61,
    '/admin/hidden/languages/{namespace}/{group}': updated94a8e2ae446d7631413baa85b6c2a4b,
}

/**
* @see \Modules\Language\Http\Controllers\LanguageController::destroy
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:144
 * @route '/api/v1/languages/{language}'
 */
export const destroy = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/languages/{language}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Modules\Language\Http\Controllers\LanguageController::destroy
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:144
 * @route '/api/v1/languages/{language}'
 */
destroy.url = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { language: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    language: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        language: args.language,
                }

    return destroy.definition.url
            .replace('{language}', parsedArgs.language.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Language\Http\Controllers\LanguageController::destroy
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:144
 * @route '/api/v1/languages/{language}'
 */
destroy.delete = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \Modules\Language\Http\Controllers\LanguageController::destroy
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:144
 * @route '/api/v1/languages/{language}'
 */
    const destroyForm = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \Modules\Language\Http\Controllers\LanguageController::destroy
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:144
 * @route '/api/v1/languages/{language}'
 */
        destroyForm.delete = (args: { language: string | number } | [language: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \Modules\Language\Http\Controllers\LanguageController::edit
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:105
 * @route '/admin/hidden/languages/{namespace}/{group}'
 */
export const edit = (args: { namespace: string | number, group: string | number } | [namespace: string | number, group: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/hidden/languages/{namespace}/{group}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Modules\Language\Http\Controllers\LanguageController::edit
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:105
 * @route '/admin/hidden/languages/{namespace}/{group}'
 */
edit.url = (args: { namespace: string | number, group: string | number } | [namespace: string | number, group: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    namespace: args[0],
                    group: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        namespace: args.namespace,
                                group: args.group,
                }

    return edit.definition.url
            .replace('{namespace}', parsedArgs.namespace.toString())
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Modules\Language\Http\Controllers\LanguageController::edit
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:105
 * @route '/admin/hidden/languages/{namespace}/{group}'
 */
edit.get = (args: { namespace: string | number, group: string | number } | [namespace: string | number, group: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \Modules\Language\Http\Controllers\LanguageController::edit
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:105
 * @route '/admin/hidden/languages/{namespace}/{group}'
 */
edit.head = (args: { namespace: string | number, group: string | number } | [namespace: string | number, group: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \Modules\Language\Http\Controllers\LanguageController::edit
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:105
 * @route '/admin/hidden/languages/{namespace}/{group}'
 */
    const editForm = (args: { namespace: string | number, group: string | number } | [namespace: string | number, group: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \Modules\Language\Http\Controllers\LanguageController::edit
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:105
 * @route '/admin/hidden/languages/{namespace}/{group}'
 */
        editForm.get = (args: { namespace: string | number, group: string | number } | [namespace: string | number, group: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \Modules\Language\Http\Controllers\LanguageController::edit
 * @see Modules/Language/app/Http/Controllers/LanguageController.php:105
 * @route '/admin/hidden/languages/{namespace}/{group}'
 */
        editForm.head = (args: { namespace: string | number, group: string | number } | [namespace: string | number, group: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
const LanguageController = { index, store, show, update, destroy, edit }

export default LanguageController