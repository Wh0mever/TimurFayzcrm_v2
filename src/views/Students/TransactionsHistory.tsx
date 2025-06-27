import RtkQueryService from '@/services/RtkQueryService';
import React from 'react'
import { useParams } from 'react-router-dom';
import TransactionsTable from './components/TransactionsTable';
import GoBackButton from '@/components/shared/GoBackButton';

const TransactionsHistory = () => {
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

    const {studentId} = useParams()



  return (
    <div>
        <div className='flex flex-col gap-2 mb-3'>
            <GoBackButton/>
            <h1>История транзакций</h1>
        </div>
        <TransactionsTable id={studentId}/>
    </div>
  )
}

export default TransactionsHistory