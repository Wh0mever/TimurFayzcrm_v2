import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'home',
        path: '/home',
        title: 'Home',
        translateKey: 'nav.home',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'students',
        path: '',
        title: 'Студенты',
        translateKey: 'Студенты',
        icon: 'students',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: ['CASHIER', 'ADMIN', 'TEACHER', 'MANAGER'],
        subMenu: [
            {
                key: 'students/students',
                path: `/students/`,
                title: 'Список студентов',
                translateKey: 'Список студентов',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['CASHIER', 'ADMIN', 'MANAGER'],
                subMenu: [],
            },
            {
                key: 'students/debt',
                path: `/students/debt`,
                title: 'Список должников',
                translateKey: 'Список должников',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['CASHIER', 'ADMIN', 'TEACHER'],
                subMenu: [],
            },
        ],
    },
    {
        key: 'groups',
        path: '/groups',
        title: 'Группы',
        translateKey: 'Группы',
        icon: 'groups',
        type: NAV_ITEM_TYPE_ITEM,
        authority: ['ADMIN', 'MANAGER'],
        subMenu: [],
    },
    {
        key: 'employees',
        path: '/employees',
        title: 'Сотрудники',
        translateKey: 'Сотрудники',
        icon: 'employees',
        type: NAV_ITEM_TYPE_ITEM,
        authority: ['ADMIN'],
        subMenu: [],
    },
    {
        key: 'kassa',
        path: '',
        title: 'Касса',
        translateKey: 'Касса',
        icon: 'kassa',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: ['CASHIER', 'ACCAUNTANT', 'ADMIN'],
        subMenu: [
            {
                key: 'kassa/expenditures',
                path: `/kassa/expenditures`,
                title: 'Транзакции',
                translateKey: 'Транзакции',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['ADMIN', 'CASHIER'],
                subMenu: [],
            },
            {
                key: 'kassa/categories',
                path: `/kassa/categories`,
                title: 'Расходы',
                translateKey: 'Расходы',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['ADMIN', 'CASHIER'],
                subMenu: [],
            }
        ],
    }
]

export default navigationConfig
