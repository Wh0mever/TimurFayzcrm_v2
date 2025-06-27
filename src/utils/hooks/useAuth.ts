import { apiSignIn } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import type { SignInCredential } from '@/@types/auth'
import { user } from '@/@types/user'

type Status = 'success' | 'failed'

function useAuth() {
    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const query = useQuery()

    const { token, signedIn } = useAppSelector((state) => state.auth.session)

    const signIn = async (values: SignInCredential): Promise<| { status: Status, message: string } | undefined> => {
        try {
            const resp = await apiSignIn(values)
            const res = await resp.json()
            const token:string = res.access
            const user:user = res.user_data
            dispatch(signInSuccess(token))
            dispatch(setUser(user))
            if (resp.ok) {
                const redirectUrl = query.get(REDIRECT_URL_KEY)
                navigate(
                    redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath
                )
                return {
                    status: 'success',
                    message: '',
                }
            }
            else {
                return {
                    status: 'failed',
                    message: "Неверный логин или пароль"
                }
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    // const signUp = async (values: SignUpCredential) => {
    //     try {
    //         const resp = await apiSignUp(values)
    //         if (resp.data) {
    //             const token = resp.data.access
    //             dispatch(signInSuccess(token))
    //             if (resp.data.user) {
    //                 dispatch(
    //                     setUser(
    //                         resp.data.user || {
    //                             avatar: '',
    //                             userName: 'Anonymous',
    //                             authority: ['USER'],
    //                             email: '',
    //                         }
    //                     )
    //                 )
    //             }
    //             const redirectUrl = query.get(REDIRECT_URL_KEY)
    //             navigate(
    //                 redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath
    //             )
    //             return {
    //                 status: 'success',
    //                 message: '',
    //             }
    //         }
    //         // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    //     } catch (errors: any) {
    //         return {
    //             status: 'failed',
    //             message: errors?.response?.data?.message || errors.toString(),
    //         }
    //     }
    // }

    const handleSignOut = () => {
        dispatch(signOutSuccess())
        dispatch(
            setUser({
                "id": 0,
                "username": "",
                "first_name": "",
                "last_name": "",
                "avatar": "",
                "authority": [],
                "is_active": false,
                is_superuser: false
            })
        )
        navigate(appConfig.unAuthenticatedEntryPath)
    }

    const signOut = () => {
        handleSignOut()
        localStorage.removeItem('admin')
        navigate('/sing-in')
    }

    return {
        authenticated: token && signedIn,
        signIn,
        signOut,
    }
}

export default useAuth
