import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const RtkQueryService = createApi({
    reducerPath: 'rtkApi',
    tagTypes: ["Students"],
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const adminData = localStorage.getItem('admin')
            if (adminData) {
                try {
                    const parsedAdmin = JSON.parse(adminData)
                    const authData = JSON.parse(parsedAdmin?.auth ?? '{}')
                    const token = authData?.session?.token ?? null

                    if (token) {
                        headers.set('Authorization', `Bearer ${token}`)
                    }
                } catch (error) {
                    console.error(
                        'Error parsing token from localStorage:',
                        error,
                    )
                }
            }
            return headers
        },
    }),
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: `/api/users/login/`,
                method: 'POST',
                body: data,
            }),
        }),

        // Student
        getAllStudents: builder.query({
            query: () => ({
                url: `/api/students/`,
                method: 'GET',
            }),
            providesTags: ['Students'],
        }),
        getStudentById: builder.query({
            query: (id) => ({
                url: `/api/students/${id}/`,
                method: 'GET',
            }),
            providesTags: ['Students'],
        }),
        getFilteredStudents: builder.query({
            query: ({ params, sortings, page }) => ({
                url: page ? `/api/students/?ordering=${sortings}&page=${page}` : `/api/students/?ordering=${sortings}`,
                method: 'GET',
                params: params !== '' ? params : null,
            }),
        }),
        addNewStudent: builder.mutation({
            query: ({ data }) => ({
                url: `/api/students/`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Students'],
        }),
        deleteStudent: builder.mutation({
            query: ({ id }) => ({
                url: `/api/students/${id}/`,
                method: 'DELETE',
            }),
        }),
        updateStudentDetails: builder.mutation({
            query: ({ data }) => ({
                url: `/api/students/${data.id}/`,
                method: 'PUT',
                body: data,
            }),
        }),
        addStudentAvatar: builder.mutation({
            query: ({ data, id }) => ({
                url: `/api/students/${id}/`,
                method: 'PUT',
                body: data,
            }),
        }),
        transferStudent: builder.mutation({
            query: ({ studentId, data }) => ({
                url: `/api/students/${studentId}/transfer-to-group/`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Students'],
        }),

        // Groups
        getAllGroups: builder.query({
            query: ({ params, page }) => {
                const url = page ? `/api/groups/?page=${page}` : `/api/groups/`;
                return {
                    url: url,
                    method: 'GET',
                    params: params,
                };
            },
        }),
        addNewGroup: builder.mutation({
            query: ({ data }) => ({
                url: `/api/groups/`,
                method: 'POST',
                body: data,
            }),
        }),
        deleteGroup: builder.mutation({
            query: ({ id }) => ({
                url: `/api/groups/${id}/`,
                method: 'DELETE',
            }),
        }),
        updateGroupDetails: builder.mutation({
            query: ({ data }) => ({
                url: `/api/groups/${data.id}/`,
                method: 'PUT',
                body: data,
            }),
        }),
        getGroupDetails: builder.query({
            query: ({ id }) => ({
                url: `/api/groups/${id}`,
                method: 'GET',
            }),
        }),

        // Epmloyees / Workers
        getAllEmployees: builder.query({
            query: () => ({
                url: `/api/workers/`,
                method: 'GET',
            }),
        }),
        getFilteredEmployees: builder.query({
            query: ({ params }) => ({
                url: `/api/workers/`,
                method: 'GET',
                params: params,
            }),
        }),
        postNewEmployee: builder.mutation({
            query: ({ data }) => ({
                url: `/api/workers/`,
                method: 'POST',
                body: data,
            }),
        }),
        updateEmployeeDetails: builder.mutation({
            query: ({ data }) => ({
                url: `/api/workers/${data.id}/`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteEmployee: builder.mutation({
            query: ({ id }) => ({
                url: `/api/workers/${id}/`,
                method: 'DELETE',
            }),
        }),
        activateEmployee: builder.mutation({
            query: ({ id }) => ({
                url: `/api/workers/${id}/activate/`,
                method: 'PUT',
            }),
        }),
        deactivateEmployee: builder.mutation({
            query: ({ id }) => ({
                url: `/api/workers/${id}/deactivate/`,
                method: 'PUT',
            }),
        }),
        changeEmployeePassword: builder.mutation({
            query: ({ id, data }) => ({
                url: `/api/workers/${id}/password/`,
                method: 'PUT',
                body: data,
            }),
        }),

        //Current user
        getCurrentUser: builder.query({
            query: () => ({
                url: `/api/users/me/`,
                method: 'GET',
            }),
        }),
        updateCurrentUser: builder.mutation({
            query: ({ data }) => ({
                url: `/api/users/me/`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteAvatar: builder.mutation({
            query: () => ({
                url: `/api/users/me/avatar/`,
                method: 'DELETE',
            }),
        }),
        changeUserPassword: builder.mutation({
            query: ({ data }) => ({
                url: `/api/users/me/password/`,
                method: 'PUT',
                body: data,
            }),
        }),

        //Student Payment
        makeStudentPayment: builder.mutation({
            query: ({ data }) => ({
                url: `/api/payments/`,
                method: 'POST',
                body: data,
            }),
        }),
        getStudentPayments: builder.query({
            query: ({ id }) => ({
                url: `/api/payments/?student=${id}`,
                method: 'GET',
            }),
        }),
        getStudentBalanceReport: builder.query({
            query: ({ id }) => ({
                url: `api/students/${id}/balance-report/`,
                method: 'GET',
            }),
        }),
        putMarkOnPayment: builder.mutation({
            query: ({ data }) => ({
                url: `/api/payments/${data.id}/`,
                method: 'PUT',
                body: data,
            }),
        }),

        //payments/summary
        getPaymentsSummary: builder.query({
            query: ({ params }) => ({
                url: `/api/payments/summary/`,
                method: 'GET',
                params: params,
            }),
        }),

        // Outlay Category
        postNewOutlayCategory: builder.mutation({
            query: ({ data }) => ({
                url: `/api/outlay-categories/`,
                method: 'POST',
                body: data,
            }),
        }),
        getAllOutlayCategories: builder.query({
            query: ({ params }) => ({
                url: `/api/outlay-categories/`,
                method: 'GET',
                params: params,
            }),
        }),
        updateOutalyCategories: builder.mutation({
            query: ({ data }) => ({
                url: `/api/outlay-categories/${data.id}/`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteOutlayCategory: builder.mutation({
            query: ({ id }) => ({
                url: `/api/outlay-categories/${id}/`,
                method: 'DELETE',
            }),
        }),
        postNewBonus: builder.mutation({
            query: ({ data }) => ({
                url: `/api/student-bonuses/`,
                method: 'POST',
                body: data,
            }),
        }),
        putMarkOnBonus: builder.mutation({
            query: ({ data }) => ({
                url: `/api/student-bonuses/${data.id}/`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteBonus: builder.mutation({
            query: ({ id }) => ({
                url: `/api/student-bonuses/${id}/`,
                method: 'DELETE',
            }),
        }),

        //Outlay CAtegory Item
        getOutlayCategoryItems: builder.query({
            query: () => ({
                url: `/api/outlay-items/`,
                method: 'GET',
            }),
        }),
        postNewOutlayCategoryItem: builder.mutation({
            query: ({ data }) => ({
                url: `/api/outlay-items/`,
                method: 'POST',
                body: data,
            }),
        }),
        updateOutlayCategoryItem: builder.mutation({
            query: ({ data }) => ({
                url: `/api/outlay-items/${data.id}/`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteOutlayCategoryItem: builder.mutation({
            query: ({ id }) => ({
                url: `/api/outlay-items/${id}/`,
                method: 'DELETE',
            }),
        }),

        //Payments
        postNewPayment: builder.mutation({
            query: ({ data }) => ({
                url: `/api/payments/`,
                method: 'POST',
                body: data,
            }),
        }),
        getAllPayments: builder.query({
            query: ({ params, page }) => ({
                url: `/api/payments/?page=${page}`,
                method: 'GET',
                params: params,
            }),
        }),
        getPaymentDetails: builder.query({
            query: ({ id }) => ({
                url: `/api/payments/${id}/`,
                method: 'GET',
            }),
        }),
        updatePayments: builder.mutation({
            query: ({ data }) => ({
                url: `/api/payments/${data.id}/`,
                method: 'PUT',
                body: data,
            }),
        }),
        deletePayment: builder.mutation({
            query: ({ id }) => ({
                url: `/api/payments/${id}/`,
                method: 'DELETE',
            }),
        }),
        getCashiers: builder.query({
            query: ({ params }) => ({
                url: `/api/cashiers/`,
                method: 'GET',
                params: params !== '' ? params : '',
            }),
        }),
        deleteStudyTransaction: builder.mutation({
            query: ({ id }) => ({
                url: `/api/transactions/${id}/`,
                method: 'DELETE',
            }),
        }),

        // send SMS

        sendSmsToDebtors: builder.mutation({
            query: ({ data }) => ({
                url: `/api/send-sms-to-debtors/`,
                method: 'POST',
                body: data,
            }),
        }),

        // Balance adjustment

        postNewBalanceAdjustment: builder.mutation({
            query: ({ data }) => ({
                url: `/api/balance-changes/`,
                method: 'POST',
                body: data,
            }),
        }),

        putMarkOnBalanceAdjustment: builder.mutation({
            query: ({ data }) => ({
                url: `/api/balance-changes/${data.id}/`,
                method: 'PUT',
                body: data,
            }),
        }),

        deleteBalanceAdjustment: builder.mutation({
            query: ({ id }) => ({
                url: `/api/balance-changes/${id}/`,
                method: 'DELETE',
            }),
        }),
    }),
})

export default RtkQueryService
