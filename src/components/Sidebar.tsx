import { Link } from "react-router-dom";
import {
    PiShippingContainerLight,
} from 'react-icons/pi'
import { useSelector } from "react-redux";
import type { RootState } from "../App/store";

const Sidebar = () => {
    const { openSidebar } = useSelector((state: RootState) => state.sidebar as { openSidebar: boolean });

    return (
        <aside className={`${openSidebar? '-left-full': 'left-0'} absolute top-0 h-full xl:left-0 xl:relative xl:col-span-3 xxl:col-span-2 bg-(--secondary-color) p-5 z-40 duration-300 shadow-xl`}>
            <h1 className="font-Plus-Jakarta-Sans font-semibold text-2xl capitalize pb-3 mb-4 border-b border-(--secondary-text) text-(--primary-color)">dashboard</h1>
            <ul className="w-full flex flex-col gap-3">
                <Link to={'/'}>
                    <li className="w-full py-3 px-4 flex items-center gap-3 duration-300 ease-in-out rounded-2xl text-(--primary-text) bg-(--secondary-text)/10 hover:bg-(--primary-color)/60">
                        <PiShippingContainerLight className="text-3xl"/>
                        <span className="font-Plus-Jakarta-Sans font-normal text-lg capitalize">shipments</span>
                    </li>
                </Link>
            </ul>
        </aside>
    )
}

export default Sidebar;