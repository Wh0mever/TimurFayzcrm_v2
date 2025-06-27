import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number | string
}
const Logo = (props: LogoProps) => {
    const {
        style,
        logoWidth = 'auto',
    } = props

    return (
        <div
            className='px-6 m-[5px] flex items-center gap-[20px] justify-center'
            style={{
                ...style,
                ...{ width: logoWidth },
            }}
        >
            <img
                className='w-[90px]'
                src={`/img/logo/png_logo.png`}
                alt={`${APP_NAME} logo`}
            />
            {/*<span className={'text-2xl text-black font-bold'}>Timur Fayz</span>*/}
        </div>
    )
}

export default Logo
