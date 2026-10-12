<?php

namespace App\Models\Presenters;

/**
 * Presenter Class for Book Module.
 */
trait UserPresenter
{
    /**
     * Get Status Label.
     *
     * @return [type] [description]
     */
    public function getStatusLabelAttribute()
    {
        switch ($this->status) {
            case '1':
                return '<span class="badge bg-success">Active</span>';
                break;
            case '2':
                return '<span class="badge bg-warning text-dark">Blocked</span>';
                break;

            default:
                return '<span class="badge bg-primary">Status:'.$this->status.'</span>';
                break;
        }
    }

    /**
     * Get Status Label.
     *
     * @return [type] [description]
     */
    public function getConfirmedLabelAttribute()
    {
        if ($this->email_verified_at != null) {
            return '<span class="badge bg-success">Confirmed</span>';
        } else {
            return '<span class="badge bg-danger">Not Confirmed</span>';
        }
    }

    /**
     * Cache Permissions Query.
     */
    public function getPermissionsAttribute()
    {
        if ($this->relationLoaded('permissions')) {
            return $this->getRelation('permissions');
        }

        return $this->permissions()->get();
    }

    /**
     * Cache Roles Query.
     */
    public function getRolesAttribute()
    {
        if ($this->relationLoaded('roles')) {
            return $this->getRelation('roles');
        }

        return $this->roles()->get();
    }
}
