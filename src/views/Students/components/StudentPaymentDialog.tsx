import React from 'react';
import {student} from "@/@types/student";
import {Button, Input, Table, Tabs} from "@/components/ui";
import {useForm} from "react-hook-form";
import {payment} from "@/@types/payment";
import rtkQueryService from "@/services/RtkQueryService";
import TBody from "@/components/ui/Table/TBody";
import THead from "@/components/ui/Table/THead";
import Tr from "@/components/ui/Table/Tr";
import Th from "@/components/ui/Table/Th";
import TabList from "@/components/ui/Tabs/TabList";
import TabNav from "@/components/ui/Tabs/TabNav";
import TabContent from "@/components/ui/Tabs/TabContent";
import { Dialog, DialogContent } from '@mui/material';
import PaymentForm from './forms/PaymentForm';
import ReturnForm from './forms/ReturnForm';
import BonusForm from './forms/BonusForm';
import AdjustmentForm from './forms/AdjustmentForm';
import formatNumber from "@/helpers/formatNumber";

interface StdPaymentPrps {
    studentData: student,
    setIsOpen: (isOpen: boolean) => void,
    isOpen: boolean,
    refetch: () => void
}

const paymentMethods = {
    CARD: 'Карта',
    CASH:'Наличные',
    TRANSFER:'Перечисление'
}

function StudentPaymentDialog({studentData, isOpen, setIsOpen, refetch}:StdPaymentPrps) {


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

   
    const { data: studentPayments } = rtkQueryService.useGetStudentPaymentsQuery({token, id: studentData.id})

    


    return (
        <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            fullWidth
            maxWidth='sm'
        >
            <DialogContent>
            <Tabs defaultValue={'tab1'}>
                <TabList>
                    <TabNav value="tab1">Оплата</TabNav>
                    <TabNav value="tab2">Возврат</TabNav>
                    <TabNav value="tab3">Льгота</TabNav>
                    <TabNav value="tab4">Изменение</TabNav>
                </TabList>
                <div>


                <TabContent value={'tab1'} >
                    <h3 className={'mt-3'}>Пополнение баланса {studentData.full_name}</h3>
                    <PaymentForm setIsOpen={setIsOpen} isOpen={isOpen} refetch={refetch} studentData={studentData}/>
                </TabContent>



                <TabContent value={'tab2'} >
                    <h3 className={'mt-3'}>Возврат денег {studentData.full_name}</h3>
                    <ReturnForm setIsOpen={setIsOpen} isOpen={isOpen} refetch={refetch} studentData={studentData}/>
                </TabContent>


                <TabContent value={'tab3'} >
                    <h3 className={'mt-3'}>Льгота для {studentData.full_name}</h3>
                    <BonusForm setIsOpen={setIsOpen} isOpen={isOpen} refetch={refetch} studentData={studentData}/>
                </TabContent>   

                <TabContent value={'tab4'} >
                    <h3 className={'mt-3'}>Изменение баланса {studentData.full_name}</h3>
                    <AdjustmentForm setIsOpen={setIsOpen} isOpen={isOpen} refetch={refetch} studentData={studentData}/>
                </TabContent>   


                </div>

            </Tabs>
            {
                studentPayments?.length > 0 &&
                (
                    <>
                        <h3 className={'mb-3'}>Последние транзакции</h3>
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>
                                        +/-
                                    </Th>
                                    <Th>
                                        Кассир
                                    </Th>
                                    <Th>
                                        Дата и время
                                    </Th>
                                    <Th>
                                        Сумма
                                    </Th>
                                    <Th>
                                        Метод
                                    </Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {
                                    studentPayments?.slice(0, 5)?.map((item:payment) => (
                                        <Tr key={item.id} style={{
                                            backgroundColor: item.payment_type === "INCOME" ? '#2AFB0060' : '#FB040060',
                                        }}>
                                            <Th>
                                                {item.payment_type === "INCOME" ? '+' : '-'}
                                            </Th>
                                            <Th>
                                                {item.created_user.first_name}
                                            </Th>
                                            <Th>
                                                {item.created_at.split('T')[0]}
                                            </Th>
                                            <Th>
                                                {formatNumber(item?.amount)}
                                            </Th>
                                            <Th>
                                                {paymentMethods[item.payment_method]}
                                            </Th>
                                        </Tr>
                                    ) )
                                }
                            </TBody>
                        </Table>
                    </>
                )
            }
            </DialogContent>
        </Dialog>
    );
}

export default StudentPaymentDialog;