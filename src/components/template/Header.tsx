import classNames from 'classnames'
import { HEADER_HEIGHT_CLASS } from '@/constants/theme.constant'
import type { ReactNode } from 'react'
import type { CommonProps } from '@/@types/common'
import {useLocation} from "react-router-dom";

interface HeaderProps extends CommonProps {
    headerStart?: ReactNode
    headerEnd?: ReactNode
    headerMiddle?: ReactNode
    container?: boolean
}

const Header = (props: HeaderProps) => {
    const { headerStart, headerEnd, headerMiddle, className, container } = props
    const { pathname } = useLocation()

    if(pathname === '/receipt') {
        return null
    } else {
        return (
            <header className={classNames('header', className)}>
                <div
                    className={classNames(
                        'header-wrapper',
                        HEADER_HEIGHT_CLASS,
                        container && 'container mx-auto'
                    )}
                >
                    <div className="header-action header-action-start">
                        {headerStart}
                    </div>
                    {headerMiddle && (
                        <div className="header-action header-action-middle">
                            {headerMiddle}
                        </div>
                    )}
                    <div className="header-action header-action-end">
                        {headerEnd}
                    </div>
                </div>
            </header>
        )
    }
    
}

export default Header
