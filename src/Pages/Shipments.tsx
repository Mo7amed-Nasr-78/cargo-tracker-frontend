import { useEffect, useState, type ChangeEvent } from "react";
import AddShipmentForm from "../components/AddShipmentForm";
import { useDispatch, useSelector } from "react-redux";
import { fetchShipments, updateShipment } from "../Features/ShipmentsSlice";
import type { AppDispatch } from "../App/store";
import type { RootState } from "../App/store";
import ShipmentMap from "../components/ShipmentMap";
import { 
	PiPlus,
	PiX,
	PiFunnel,
	PiList,
} from "react-icons/pi";
import axios from "axios";
import { sidebarTogle } from "../Features/SidebarSlice";

interface Shipment {
    shipmentId: string,
    containerId: string,
    status: string
    origin: {
        location: string,
        coordinates: {
            lat: number,
            lng: number
        }
    },
    destination: {
        location: string,
        coordinates: {
            lat: number,
            lng: number
        }
    },
	route?: [{
		coordinates: [[number, number]],
		updatedAt: Date
	}],
    currentETA: number,
    currentLocation: {
        location: string,
        coordinates: {
            lat: number,
            lng: number
        },
        updatedAt: Date
    }
}

interface Filter {
	status: string,
	orderBy: string,
}

interface location {
    location: string,
    coordinates: {
        lat: number,
        lng: number
    }
}

const Shipments = () => {

	const dispatch = useDispatch<AppDispatch>();
	const { data, loading, error } = useSelector((state: RootState) => state.shipments as { data: Shipment[], loading: boolean, error: string | undefined });
	const [ shipment, setShipment ] = useState<Shipment>();
	const [openForm, setOpenForm] = useState(false);
	const [ openMap, setOpenMap ] = useState(false);
	const [ openDropdown, setOpenDropdown ] = useState(false);
	const [ filter, setFilter ] = useState<Filter>({
		status: '',
		orderBy: ''
	})
	const [ currentLocation, setCurrentLocation ] = useState<location | null>();

	useEffect(() => {
		dispatch(fetchShipments(filter));
	}, [filter]);

	const getShipment = async (id: string) => {
		const s = data.filter((i) => i.shipmentId === id)[0];
		setShipment(s);
		setOpenMap(true);
	}

	const handleChange =(event: ChangeEvent<HTMLInputElement>) => {
		setFilter((prev) => {
			return { ...prev, [event.target.name]: event.target.value }
		});
		setOpenDropdown(!openDropdown);
	}

	const updateCurrentLocation = async (value: location | null | undefined) => {
		if (!value) {
			alert('Please, select new current location on map first');
			return;
		}

		try {
			const { data } = await axios.post(
				`${import.meta.env.VITE_APP_URL}/api/shipment/${shipment?.shipmentId}/update-location`,
				{
					currentLocation
				},
			)
			alert(data.msg);
			dispatch(updateShipment(data));
		} catch (err) {
			console.log(err);
		} finally {
			setOpenMap(!openMap);
			setCurrentLocation(null);
		}

	}

	if (error) {
		alert(error);
		return;
	}

	return (
		<section className="relative w-full h-full flex flex-col col-span-12 xl:col-span-9 xxl:col-span-10 p-6">
			<header className="flex items-center justify-between pb-3 border-b border-(--secondary-text) mb-4">
				<h2 className="font-Plus-Jakarta-Sans font-normal text-xl text-(--primary-text) capitalize">
					shipments
				</h2>
				<div className="h-10 sm:h-11 flex items-center justify-center gap-3">
					<div className="relative h-full">
						<button
							onClick={() => setOpenDropdown(!openDropdown)}
							className="h-full px-3 sm:px-4 flex items-center justify-center gap-1 rounded-xl sm:rounded-2xl border border-(--primary-color)/60 text-(--primary-color) duration-300 ease-in-out hover:bg-transparent hover:scale-95 cursor-pointer z-40"
						>
							<PiFunnel className="text-xl" />
							<span className="hidden sm:block font-Plus-Jakarta-Sans font-light text-base capitalize">
								sort
							</span>
						</button>
						<div className={`${openDropdown? 'block': 'hidden'} absolute top-full right-0 w-62 mt-1 px-3 py-4 z-50 bg-(--bg-color) outline outline-offset-1 outline-white/10 rounded-xl shadow-lg shadow-white/8`}>
							<div className="flex flex-col gap-3 mb-4">
								<h3 className="font-Plus-Jakarta-Sans font-light text-sm capitalize text-(--primary-text) pb-2 border-b border-white/25">status</h3>
								<div className="flex flex-col gap-1.5">
									<label htmlFor="all" className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer">
										<span className="font-Plus-Jakarta-Sans font-light text-sm capitalize text-(--secondary-text)">all</span>
										<input type="radio" onChange={handleChange} id="all" name="status" value={''}/>
									</label>
									<label htmlFor="pending" className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer">
										<span className="font-Plus-Jakarta-Sans font-light text-sm capitalize text-(--secondary-text)">pending</span>
										<input type="radio" onChange={handleChange} id="pending" name="status" value={'pending'}/>
									</label>
									<label htmlFor="delayed" className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer">
										<span className="font-Plus-Jakarta-Sans font-light text-sm capitalize text-(--secondary-text)">delayed</span>
										<input type="radio" onChange={handleChange} id="delayed" name="status" value={'delayed'}/>
									</label>
									<label htmlFor="in-transit" className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer">
										<span className="font-Plus-Jakarta-Sans font-light text-sm capitalize text-(--secondary-text)">in-transit</span>
										<input type="radio" onChange={handleChange} id="in-transit" name="status" value={'in-transit'}/>
									</label>
									<label htmlFor="cancelled" className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer">
										<span className="font-Plus-Jakarta-Sans font-light text-sm capitalize text-(--secondary-text)">cancelled</span>
										<input type="radio" onChange={handleChange} id="cancelled" name="status" value={'cancelled'}/>
									</label>
									<label htmlFor="delivered" className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer">
										<span className="font-Plus-Jakarta-Sans font-light text-sm capitalize text-(--secondary-text)">delivered</span>
										<input type="radio" onChange={handleChange} id="delivered" name="status" value={'delivered'}/>
									</label>
								</div>
							</div>
							<div className="flex flex-col gap-3">
								<h3 className="font-Plus-Jakarta-Sans font-light text-sm capitalize text-(--primary-text) pb-2 border-b border-white/25">order by</h3>
								<div className="flex flex-col gap-1.5">
									<label htmlFor="latest" className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer">
										<span className="font-Plus-Jakarta-Sans font-light text-sm capitalize text-(--secondary-text)">latest</span>
										<input type="radio" onChange={handleChange} id="latest" name="orderBy" value={'latest'}/>
									</label>
									<label htmlFor="oldest" className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer">
										<span className="font-Plus-Jakarta-Sans font-light text-sm capitalize text-(--secondary-text)">oldest</span>
										<input type="radio" onChange={handleChange} id="oldest" name="orderBy" value={'oldest'}/>
									</label>
									<label htmlFor="containerId" className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer">
										<span className="font-Plus-Jakarta-Sans font-light text-sm capitalize text-(--secondary-text)">containerId</span>
										<input type="radio" onChange={handleChange} id="containerId" name="orderBy" value={'container'}/>
									</label>
									<label htmlFor="ETA" className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer">
										<span className="font-Plus-Jakarta-Sans font-light text-sm capitalize text-(--secondary-text)">ETA</span>
										<input type="radio" onChange={handleChange} id="ETA" name="orderBy" value={'eta'}/>
									</label>
								</div>
							</div>
						</div>
					</div>
					<button
						onClick={() => setOpenForm(!openForm)}
						className="h-full px-3 sm:px-4 flex items-center justify-center gap-1 rounded-xl sm:rounded-2xl border border-(--primary-color)/60 text-(--primary-color) duration-300 ease-in-out hover:bg-transparent hover:scale-95 cursor-pointer"
					>
						<PiPlus className="text-xl" />
						<span className="hidden sm:block font-Plus-Jakarta-Sans font-light text-base capitalize">
							new shipment
						</span>
					</button>
					<div onClick={() => dispatch(sidebarTogle())} className="w-10 h-10 flex xl:hidden items-center justify-center rounded-full border border-(--primary-color) duration-300 hover:scale-90 cursor-pointer">
						<PiList className="text-lg text-(--primary-color)"/>
					</div>
				</div>
			</header>
			<div className="relative w-full h-full overflow-x-scroll">
				{
					!loading?
						<>
							{data?.length > 0 ? (
								<table className="w-full max-h-full border-spacing-5">
									<thead>
										<tr>
											<th
												scope="col"
												className="font-Plus-Jakarta-Sans font-normal text-base text-(--primary-text) capitalize text-nowrap py-4 pe-6 text-start"
											>
												containerId
											</th>
											<th
												scope="col"
												className="font-Plus-Jakarta-Sans font-normal text-base text-(--primary-text) capitalize text-nowrap py-4 pe-6 text-start"
											>
												shipmentId
											</th>
											<th
												scope="col"
												className="font-Plus-Jakarta-Sans font-normal text-base text-(--primary-text) capitalize text-nowrap py-4 pe-6 text-start"
											>
												origin
											</th>
											<th
												scope="col"
												className="font-Plus-Jakarta-Sans font-normal text-base text-(--primary-text) capitalize text-nowrap py-4 pe-6 text-start"
											>
												destination
											</th>
											<th
												scope="col"
												className="font-Plus-Jakarta-Sans font-normal text-base text-(--primary-text) capitalize text-nowrap py-4 pe-6 text-start"
											>
												current location
											</th>
											<th
												scope="col"
												className="font-Plus-Jakarta-Sans font-normal text-base text-(--primary-text) capitalize text-nowrap py-4 pe-6 text-start"
											>
												ETA
											</th>
											<th
												scope="col"
												className="font-Plus-Jakarta-Sans font-normal text-base text-(--primary-text) capitalize text-nowrap py-4 pe-6 text-start"
											>
												status
											</th>
											<th
												scope="col"
												className="font-Plus-Jakarta-Sans font-normal text-base text-(--primary-text) capitalize text-nowrap py-4 pe-6 text-start"
											>
												map
											</th>
										</tr>
									</thead>
									<tbody>
										{data.map((shipment: Shipment, idx: number) => {
											return (
												<tr key={idx}>
													<td className="font-Plus-Jakarta-Sans font-light text-base text-(--secondary-text) py-2 pe-8 text-nowrap">
														{shipment.containerId}
													</td>
													<td className="font-Plus-Jakarta-Sans font-light text-base text-(--secondary-text) py-2 pe-8 text-nowrap">
														{shipment.shipmentId}
													</td>
													<td className="font-Plus-Jakarta-Sans font-light text-base text-(--secondary-text) py-2 pe-8 text-nowrap">
														{shipment.origin.location}
													</td>
													<td className="font-Plus-Jakarta-Sans font-light text-base text-(--secondary-text) py-2 pe-8 text-nowrap">
														{shipment.destination.location}
													</td>
													<td className="font-Plus-Jakarta-Sans font-light text-base text-(--secondary-text) py-2 text-nowrap pe-8">
														{shipment.currentLocation.location}
													</td>
													<td className="font-Plus-Jakarta-Sans font-light text-base text-(--secondary-text) py-2 pe-8 text-nowrap">
														{shipment.currentETA}m
													</td>
													<td className="font-Plus-Jakarta-Sans font-light text-base text-(--secondary-text) py-2 pe-8 text-nowrap">
														<div className={`${['in-transit', 'pending'].includes(shipment.status)? 'text-(--primary-color) bg-(--primary-color)/10': shipment.status === 'delivered'? 'text-[#007BFF] bg-[#007BFF]/10': shipment.status === 'cancelled'? 'text-[#DC3545] bg-[#DC3545]/10': 'text-[#FFC107] bg-[#FFC107]/10'} px-2 py-1.5 font-Plus-Jakarta-Sans font-light text-sm text-center capitalize rounded-lg`}>
															{shipment.status}
														</div>
													</td>
													<td className="py-2">
														<button onClick={() => { getShipment(shipment.shipmentId) }} className="px-3 py-1.5 font-Plus-Jakarta-Sans font-normal text-sm text-(--primary-text) capitalize bg-(--primary-color)/75 rounded-xl duration-300 ease-in-out hover:scale-95 cursor-pointer">
															view
														</button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							) : (
								<div className="w-full h-[90%] flex items-center justify-center">
									<h1 className="font-Plus-Jakarta-Sans font-normal text-base text-(--primary-text) capitalize">
										no shipments found
									</h1>
								</div>
							)};
						</>
					:
					<div className="w-full h-full flex items-center justify-center">
						<div className="w-12 h-12 rounded-full animate-spin border-3 border-(--primary-color) border-t-transparent"></div>
					</div>
				}
			</div>
			{openForm ? (
				<AddShipmentForm
					onCancel={(): void => setOpenForm(false)}
				/>
			) : null}
			{ openMap && (
				<div className="absolute top-0 left-0 w-full h-full bg-(--bg-color)/50">
					<div className="absolute top-1/2 left-1/2 -translate-1/2 w-[90%] h-130 flex flex-col bg-(--bg-color) outline outline-offset-1 outline-white/10 rounded-xl shadow shadow-white/10 z-[60] p-4 overflow-hidden">
						<h4 className="font-Plus-Jakarta-Sans font-normal text-lg text-(--primary-text) capitalize mb-2">map:</h4>
						<ShipmentMap 
							mode="tracking"
							origin={shipment?.origin}
							destination={shipment?.destination}
							currentLocation={shipment?.currentLocation}
							route={shipment?.route?.[0].coordinates}
							zoom={8}
							onSelectCurrentLocation={(value) => setCurrentLocation(value)}
						/>
						<button onClick={(): void => setOpenMap(false)} className="absolute w-8 h-8 flex items-center justify-center top-0 right-0 duration-300 bg-red-500/50 hover:bg-red-500 cursor-pointer text-(--primary-text)">
							<PiX className="text-xl" />
						</button>
						<div className="flex justify-end mt-5">
							<button onClick={() => updateCurrentLocation(currentLocation)} className="px-3 py-2 font-Plus-Jakarta-Sans font-normal text-base capitalize border border-(--primary-color) rounded-2xl text-(--primary-text) duration-300 hover:bg-(--primary-color) cursor-pointer">update current location</button>
						</div>
					</div>
				</div>
            ) }
		</section>
	);
};

export default Shipments;
