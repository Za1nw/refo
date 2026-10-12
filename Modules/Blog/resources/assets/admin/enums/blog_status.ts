export enum BlogStatus {
    All = 'all',
    Active = 'active',
    Inactive = 'inactive',
}

export function getAllBlogStatuses(): BlogStatus[] {
    return [BlogStatus.All, BlogStatus.Active, BlogStatus.Inactive];
}
