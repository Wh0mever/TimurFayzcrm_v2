import React, { useRef } from 'react';
import Logo from "@/components/template/Logo";
import { useParams } from 'react-router-dom';
import RtkQueryService from '@/services/RtkQueryService';
import { Button, Spinner } from '@/components/ui';
import { BsPrinterFill } from "react-icons/bs";
import { useReactToPrint } from 'react-to-print'
import GoBackButton from '@/components/shared/GoBackButton';
import { TiTick } from "react-icons/ti";
import formatNumber from "@/helpers/formatNumber";


function EntrancePage() {
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

    const {transactionId} = useParams()
    const contentRef  = useRef(null)
    const reactToPrintFn = useReactToPrint({ contentRef  });

    const {data, isLoading} = RtkQueryService.useGetPaymentDetailsQuery({token, id:transactionId})
    
    if(isLoading) {
        return(
            <div className=' w-full h-full flex items-center justify-center'>
                <Spinner size="3.25rem" />
            </div>
        )
    }


    return (
        <div className={' text-[#262A48]'}>
            <div className="mt-10 ml-10">
                <GoBackButton/>
            </div>

            <Button variant='solid' onClick={() => reactToPrintFn()} className='flex gap-1 items-center mt-10 ml-10'>
                <BsPrinterFill size={20}/> Распечатать
            </Button>
            
            <div id="print" ref={contentRef } className='p-5'> 
                <div className="border-b-2 border-[#262A48] pb-5">
                <div className="top flex justify-between mt-[10px] mb-[10px]">
                    <h3>Квитанция</h3>
                    <h3>NTM "{data?.department === 'KINDERGARTEN' ? 'TIMUR FAYZ' : 'TIMUR FAYZ SCHOOL'}"</h3>
                    <div className="date flex gap-5 border-b-2 border-[#262A48] h-fit mr-[11%]">
                        <span className='font-bold text-md h-fit'>№</span>
                        <span className='font-medium text-md h-fit'>{data?.id}</span>
                    </div>
                </div>
                <div className="mid flex w-full justify-between items-end gap-5">
                    <div className="left w-full flex flex-col gap-4">
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>СТУДЕНТ</span>
                            <span className='font-medium text-md'>{data?.student_obj.full_name} </span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>НОМЕР ТЕЛЕФОНА СТУДЕНТА</span>
                            <span className='font-medium text-md'>{data?.student_obj.phone_number} </span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>ЛИЦЮ СЧЁТ СТУДЕНТА</span>
                            <span className='font-medium text-md'>{data?.student_obj.account_number} </span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>ДАТА</span>
                            <span className='font-medium text-md'>{data?.created_at.slice(0, 10)} {data?.created_at.slice(11, 16)}</span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>КАССИР</span>
                            <span className='font-medium text-md'>{data?.created_user.first_name}</span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>СУММА</span>
                            <span className='font-medium text-md'>{formatNumber(data?.amount)}</span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>ДОП. ИНФО</span>
                            <span className='font-medium text-md'>{data?.comment} {(data?.payment_model_type === 'STUDENT' && data?.payment_type === 'OUTCOME') && '(возврат)'}</span>
                        </div>
                    </div>
                    <div className="right w-[15%]">
                        <img
                            className=''
                            src={`/img/logo/png_logo.png`}
                        />
                    </div>
                </div>
                <div className="bot mt-5 flex justify-between items-end">
                    <div className="lfet">
                        <table>
                            <tbody>
                                <tr>
                                    <td className='border-2 border-[#262A48] p-1 text-md font-bold'>Полная</td>
                                    <td className='border-2 border-[#262A48] p-1 text-md font-bold w-[30px]'>{data.student_balance_after == 0 && <TiTick size={25} />}</td>
                                </tr>
                                <tr>
                                    <td className='border-2 border-[#262A48] p-1 text-md font-bold'>Частичная</td>
                                    <td className='border-2 border-[#262A48] p-1 text-md font-bold w-[30px]'>{data.student_balance_after < 0 && <TiTick size={25} />}</td>
                                </tr>
                                <tr>
                                    <td className='border-2 border-[#262A48] p-1 text-md font-bold'>Предоплата</td>
                                    <td className='border-2 border-[#262A48] p-1 text-md font-bold w-[30px]'>{data.student_balance_after > 0 && <TiTick size={25} />}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="rihgt w-[30%] flex flex-col gap-4">
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>ПРИНЯТО</span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>ПОДПИСЬ</span>
                        </div>
                    </div>
                </div>
                </div>
                <div className="top flex justify-between mt-[10px]">
                    <h3>Квитанция</h3>
                    <h3>NTM "{data?.department === 'KINDERGARTEN' ? 'TIMUR FAYZ' : 'TIMUR FAYZ SCHOOL'}"</h3>
                    <div className="date flex gap-5 border-b-2 border-[#262A48] h-fit mr-[11%]">
                        <span className='font-bold text-md h-fit'>№</span>
                        <span className='font-medium text-md h-fit'>{data?.id}</span>
                    </div>
                </div>
                <div className="mid flex w-full justify-between items-end gap-5">
                    <div className="left w-full flex flex-col gap-4">
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>СТУДЕНТ</span>
                            <span className='font-medium text-md'>{data?.student_obj.full_name}</span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>НОМЕР ТЕЛЕФОНА СТУДЕНТА</span>
                            <span className='font-medium text-md'>{data?.student_obj.phone_number} </span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>ЛИЦЮ СЧЁТ СТУДЕНТА</span>
                            <span className='font-medium text-md'>{data?.student_obj.account_number} </span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>ДАТА</span>
                            <span className='font-medium text-md'>{data?.created_at.slice(0, 10)} {data?.created_at.slice(11, 16)}</span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>КАССИР</span>
                            <span className='font-medium text-md'>{data?.created_user.first_name}</span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>СУММА</span>
                            <span className='font-medium text-md'>{formatNumber(data?.amount)}</span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>ДОП. ИНФО</span>
                            <span className='font-medium text-md'>{data?.comment} {(data?.payment_model_type === 'STUDENT' && data?.payment_type === 'OUTCOME') && '(возврат)'}</span>
                        </div>
                    </div>
                    <div className="right w-[15%]">
                        <img
                            className=''
                            src={`/img/logo/png_logo.png`}
                        />
                    </div>
                </div>
                <div className="bot mt-5 flex justify-between items-end">
                    <div className="lfet">
                        <table>
                            <tbody>
                                <tr>
                                    <td className='border-2 border-[#262A48] p-1 text-md font-bold'>Полная</td>
                                    <td className='border-2 border-[#262A48] p-1 text-md font-bold w-[30px]'>{data.student_balance_after == 0 && <TiTick size={25} />}</td>
                                </tr>
                                <tr>
                                    <td className='border-2 border-[#262A48] p-1 text-md font-bold'>Частичная</td>
                                    <td className='border-2 border-[#262A48] p-1 text-md font-bold w-[30px]'>{data.student_balance_after < 0 && <TiTick size={25} />}</td>
                                </tr>
                                <tr>
                                    <td className='border-2 border-[#262A48] p-1 text-md font-bold'>Предоплата</td>
                                    <td className='border-2 border-[#262A48] p-1 text-md font-bold w-[30px]'>{data.student_balance_after > 0 && <TiTick size={25} />}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="rihgt w-[30%] flex flex-col gap-4">
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>ПРИНЯТО</span>
                        </div>
                        <div className="date flex gap-5 border-b-2 border-[#262A48]">
                            <span className='font-bold text-md'>ПОДПИСЬ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EntrancePage;