import React from 'react';
import {IoIosArrowBack} from "react-icons/io";
import {useNavigate} from "react-router-dom";

function GoBackButton() {

    const navigate = useNavigate()

    return (
        <div onClick={() => navigate(-1)} className={'px-3 py-1 cursor-pointer border-[1px] border-[#E5E7EB] bg-[#F9FAFB] rounded-md w-fit h-fit flex items-center justify-center'}>
            <IoIosArrowBack size={20} className={'cursor-pointer'} />
            <span>Вернуться назад</span>
        </div>
    );
}

export default GoBackButton;