import React, { useState} from 'react';
import Button from "@/components/ui/Button";
import {HiPlusCircle} from "react-icons/hi";
import rtkQueryService from "@/services/RtkQueryService";
import CategoriesTable from "@/views/Kassa/Categories/components/CategoriesTable";
import { useAppSelector } from '@/store';
import AddCategoryItemDialog from "@/views/Kassa/Categories/components/AddCategoryItemDialog";

function Categories() {
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

    const {authority} = useAppSelector(
        (state) => state.auth.user
    )

    // const navigate = useNavigate()

    // const userAuthority = authority

	// const authorities = ['CASHIER', 'ACCAUNTANT']

	// const roleMatched = useAuthority(userAuthority, authorities)

    const [isOpen, setIsOpen] = useState<boolean>(false)
    const {data: categories} = rtkQueryService.useGetOutlayCategoryItemsQuery({token})


    return (
        <div>
           <div className={'flex justify-between items-center mb-10'}>
               <h2>Причины расходов/доходов</h2>
               <Button
                   block
                   variant="solid"
                   size="sm"
                   icon={<HiPlusCircle />}
                   style={{
                       width:'fit-content'
                   }}
                   onClick={() => setIsOpen(true)}
               >
                   Добавить причину
               </Button>
               {isOpen && <AddCategoryItemDialog isOpen={isOpen} setIsOpen={setIsOpen}/>}
           </div>
            <CategoriesTable categories={categories}/>
        </div>
    );
}

export default Categories;