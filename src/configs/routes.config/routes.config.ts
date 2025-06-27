import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes = [
    {
        key: 'receipt',
        path: '/receipt/:transactionId',
        component: lazy(() => import('@/views/ReceiptPage/ReceiptPage')),
        authority: [],
    },
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'students',
        path: '/students',
        component: lazy(() => import('@/views/Students/Students')),
        authority: ['CASHIER', 'ADMIN', 'MANAGER'],
    },
    {
        key: 'students',
        path: '/students/debt',
        component: lazy(() => import('@/views/Students/StudentsDebt')),
        authority: ['CASHIER', 'ADMIN', 'TEACHER'],
    },
    {
        key: 'students',
        path: '/student/transactionHistory/:studentId',
        component: lazy(() => import('@/views/Students/TransactionsHistory')),
        authority: ['CASHIER', 'ADMIN', 'TEACHER'],
    },
    {
        key: 'groups',
        path: '/groups',
        component: lazy(() => import('@/views/Groups/Groups')),
        authority: ['ADMIN', 'MANAGER'],
    },
    {
        key: 'group',
        path: '/group/:groupId',
        component: lazy(() => import('@/views/GroupPage/GroupPage')),
        authority: ['ADMIN', 'MANAGER'],
    },
    {
        key: 'employees',
        path: '/employees/',
        component: lazy(() => import('@/views/Employees/Employees')),
        authority: ['ADMIN'],
    },
    {
        key: 'profile',
        path: '/profile/',
        component: lazy(() => import('@/views/Profile/Profile')),
        authority: [],
    },
    {
        key: 'kassa',
        path: '/kassa/expenditures',
        component: lazy(() => import('@/views/Kassa/Expenditures/Expenditures')),
        authority: ['CASHIER', 'ACCAUNTANT', 'ADMIN'],
    },
    {
        key: 'kassa',
        path: '/kassa/categories',
        component: lazy(() => import('@/views/Kassa/Categories/Categories')),
        authority: ['CASHIER', 'ACCAUNTANT', 'ADMIN'],
    },
    {
        key: 'access-denied',
        path: '/access-denied',
        component: lazy(() => import('@/views/AccessDenied')),
        authority: [],
    }
]