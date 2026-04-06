export const APP_ROUTES = {
    AUTH : {
        LOGIN : 'auth/login',
        FORGOT_PASSWORD : 'auth/forgot-password',
    },
    DASHBOARD : 'dashboard',
    JOB : {
        LIST : 'job/list',
        CREATE : 'job/create',
        EDIT : (id: string) => `job/edit/${id}`,
    }
}