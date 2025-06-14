import {
    HiOutlineHome,
} from 'react-icons/hi'
import { PiStudentFill } from "react-icons/pi";
import { MdGroups } from "react-icons/md";
import { GrUserWorker } from "react-icons/gr";
import { TbPigMoney } from "react-icons/tb";

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <HiOutlineHome />,
    students: <PiStudentFill/>,
    groups: <MdGroups />,
    employees: <GrUserWorker/>,
    kassa: <TbPigMoney/>
}

export default navigationIcon
