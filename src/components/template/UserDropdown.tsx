import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useAuth from '@/utils/hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { HiOutlineLogout, HiOutlineUser } from 'react-icons/hi'
import type { CommonProps } from '@/@types/common'
import { CgProfile } from "react-icons/cg";
import rtkQueryService from "@/services/RtkQueryService";
import { useAppSelector } from '@/store'
import { useEffect } from 'react'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const dropdownItemList: DropdownList[] = []

const _UserDropdown = ({ className }: CommonProps) => {
    const adminData = localStorage.getItem("admin");

    let token: string | null = null;

    if (adminData) {
        try {
            const parsedAdmin = JSON.parse(adminData);
            const authData = JSON.parse(parsedAdmin?.auth ?? '{}'); // Handle missing `auth`
            token = authData?.session?.token ?? null; // Safely access nested properties
            
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    }
    const {
        data: user,
        error,
        isError,
    } = rtkQueryService.useGetCurrentUserQuery(token)

    const { signOut } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (isError && error && 'status' in error && error.status === 401) {
            signOut()
            navigate('/sign-in')
        }
    }, [isError, error, signOut, navigate])

    const {authority} = useAppSelector(
        (state) => state.auth.user
    )

    

    const UserAvatar = (
        <div className={classNames(className, 'flex items-center gap-2')}>
            <Avatar size={32} shape="circle" icon={<img className={'rounded-full'} src={user?.avatar} />} />
            <div className="hidden md:block">
                <div className="text-xs capitalize">{user?.user_type}</div>
                <div className="font-bold">{user?.first_name} {user?.last_name}</div>
            </div>
        </div>
    )

    return (
        <div>
            <Dropdown
                menuStyle={{ minWidth: 240 }}
                renderTitle={UserAvatar}
                placement="bottom-end"
            >
                <Dropdown.Item variant="header">
                    <div className="py-2 px-3 flex items-center gap-2">
                        <Avatar shape="circle" icon={<img className={'rounded-full'} src={user?.avatar} />} />
                        <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                                {user?.first_name} {user?.last_name}
                            </div>
                            <div className="text-xs">{user?.username}</div>
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                {dropdownItemList.map((item) => (
                    <Dropdown.Item
                        key={item.label}
                        eventKey={item.label}
                        className="mb-1 px-0"
                    >
                        <Link 
                            className="flex h-full w-full px-2" 
                            to={item.path}
                        >
                            <span className="flex gap-2 items-center w-full">
                                <span className="text-xl opacity-50">
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </span>
                        </Link>
                    </Dropdown.Item>
                ))}
                {/* <Dropdown.Item variant="divider" /> */}
                <Link to={'/profile'}>
                    <Dropdown.Item
                        eventKey="Profile"
                        className="gap-2"
                    >
                            <span className="text-xl opacity-50">
                                <CgProfile />
                            </span>
                           <span>Профиль</span>
                    </Dropdown.Item>
                </Link>
                <Dropdown.Item
                    eventKey="Sign Out"
                    className="gap-2"
                    onClick={signOut}
                >
                    <span className="text-xl opacity-50">
                        <HiOutlineLogout />
                    </span>
                    <span>Выйти</span>
                </Dropdown.Item> </Dropdown>
        </div>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
