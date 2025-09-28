import React, { useState } from "react";
import axios from "axios";
import {
    PiMapPin,
    PiX
} from 'react-icons/pi';
import ShipmentMap from "./ShipmentMap";
import { useDispatch } from "react-redux";
import { addShipment } from "../Features/ShipmentsSlice";
import type { AppDispatch } from "../App/store";

function AddShipmentForm({ onCancel }: { onCancel: (value: boolean) => void }) {

    interface location {
        location: string,
        coordinates: {
            lat: number,
            lng: number
        }
    }

    interface formTypes {
        containerId: string,
        origin: location,
        destination: location
    }

    const formData: formTypes = {
        containerId: '',
        origin: {
            location: '',
            coordinates: {
                lat: 0,
                lng: 0
            }
        },
        destination: {
            location: '',
            coordinates: {
                lat: 0,
                lng: 0
            }
        }
    }

    const dispatch = useDispatch<AppDispatch>();
    const [ openMap, setOpenMap ] = useState(false);
    const [ form, setForm ] = useState<formTypes>(formData);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        if (name === 'origin') {
            setForm({
                ...form,
                origin: {
                    ...form.origin,
                    location: value
                }
            })
        }

        if (name === 'destination') {
            setForm({
                ...form,
                origin: {
                    ...form.origin,
                    location: value
                }
            })
        }

    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const { containerId, origin, destination } = form;

        if (!containerId || !origin.location || !destination.location) {
            alert('Please, fill all details');
            return;
        }

        // get LatLng if it's unselected
        if (!origin.coordinates.lat || !origin.coordinates.lng) {
            try {
                const { data } = await axios.get(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(origin.location)}&format=json&limit=1`
                );

                if (data.length < 1) {
                    alert('invalid location');
                    return
                }

                setForm({
                    ...form, 
                    origin: {
                        ...form.origin,
                        coordinates: {
                            lat: parseFloat(data[0].lat),
                            lng: parseFloat(data[0].lon)
                        }
                    }
                })
            } catch(err) {
                console.log(err);
                alert(err);
            }
        }

        // get LatLng if it's unselected
        if (!destination.coordinates.lat || !destination.coordinates.lng) {
            try {
                const { data } = await axios.get(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination.location)}&format=json&limit=1`
                );
                setForm({
                    ...form, 
                    destination: {
                        ...form.destination,
                        coordinates: {
                            lat: parseFloat(data[0].lat),
                            lng: parseFloat(data[0].lon)
                        }
                    }
                })
            } catch(err) {
                console.log(err);
            }
        }

        // Shipment creating request
        try {
            const { data: { routes } } = await axios.get(`http://router.project-osrm.org/route/v1/driving/${origin.coordinates.lng},${origin.coordinates.lat};${destination.coordinates.lng},${destination.coordinates.lat}?overview=full&geometries=geojson`);
            const minutes = Math.floor(routes[0].duration / 60);

            const { data } = await axios.post(
                `${import.meta.env.VITE_APP_URL}/api/shipment`,
                {
                    containerId,
                    origin,
                    destination,
                    eta: minutes,
                    route: routes[0].geometry.coordinates,
                }
            );
            // Add the new shipment to current state
            dispatch(addShipment(data.shipment));
        } catch(err) {
            console.log(err);
            alert(err);
        } finally {
            setForm(formData);
            onCancel?.(false);
        }

    }

    return (
        <div className="absolute w-full h-full flex items-center justify-center top-0 left-0 bg-(--bg-color)/75 z-50 px-5">
            <form onSubmit={handleSubmit} className="w-120 p-6 bg-(--bg-color) outline outline-offset-1 outline-white/10 rounded-xl shadow shadow-white/10">
                <h2 className="font-Plus-Jakarta-Sans font-medium text-2xl text-(--primary-text) capitalize text-center pb-3 mb-6 border-b border-(--secondary-text)/75">add new shipment</h2>
                <div className="flex flex-col gap-3 mb-8">
                    <label htmlFor="containerId">
                        <h4 className="font-Plus-Jakarta-Sans font-normal text-base capitalize text-(--secondary-text)">containerId</h4>
                        <input 
                            type="text"
                            name="containerId"
                            value={form.containerId}
                            onChange={(event) => { setForm({ ...form, containerId: event.target.value.trim() }) }}
                            placeholder="enter shipment containerId"
                            autoComplete="off"
                            className="w-full py-2 px-3 border-b border-(--secondary-text)/50 text-base placeholder:font-light placeholder:text-(--secondary-text)/50 text-(--primary-text) capitalize focus:outline-none"
                        />
                    </label>
                    <label htmlFor="origin">
                        <h4 className="font-Plus-Jakarta-Sans font-normal text-base capitalize text-(--secondary-text)">origin</h4>
                        <input 
                            type="text"
                            name="origin"
                            value={form.origin.location}
                            onChange={handleChange}
                            placeholder="enter shipment origin"
                            autoComplete="off"
                            className="w-full py-2 px-3 border-b border-(--secondary-text)/50 text-base placeholder:font-light placeholder:text-(--secondary-text)/50 text-(--primary-text) capitalize focus:outline-none"
                        />
                    </label>
                    <label htmlFor="destination">
                        <h4 className="font-Plus-Jakarta-Sans font-normal text-base capitalize text-(--secondary-text)">destination</h4>
                        <input 
                            type="text"
                            name="destination"
                            value={form.destination.location}
                            onChange={(event) => { setForm({ ...form, destination: { ...form.destination, location: event.target.value.trim() } }) }}
                            placeholder="enter shipment destination"
                            autoComplete="off"
                            className="w-full py-2 px-3 border-b border-(--secondary-text)/50 text-base placeholder:font-light placeholder:text-(--secondary-text)/50 text-(--primary-text) capitalize focus:outline-none"
                        />
                    </label>
                    <div onClick={(): void => setOpenMap(!openMap)} className="w-fit flex items-center gap-1 border-b border-(--primary-color) cursor-pointer mt-2">
                        <PiMapPin className="text-lg text-(--primary-color)" />
                        <span className="font-Plus-Jakarta-Sans font-light text-sm text-(--primary-color) capitalize">shipment location</span>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                    <button type="submit" className="w-24 py-2 font-Plus-Jakarta-Sans font-normal text-base capitalize border border-(--primary-color) rounded-2xl text-(--primary-text) duration-300 hover:bg-(--primary-color) cursor-pointer">add</button>
                    <button onClick={(): void => onCancel?.(false)} className="w-24 py-2 font-Plus-Jakarta-Sans font-normal text-base capitalize border border-red-500 rounded-2xl text-(--primary-text) duration-300 hover:bg-red-500 cursor-pointer">cancel</button>
                </div>
            </form>
            { openMap && (
                <div className="absolute top-1/2 left-1/2 -translate-1/2 w-[90%] h-120 flex flex-col bg-(--bg-color) outline outline-offset-1 outline-white/10 rounded-xl shadow shadow-white/10 z-[60] p-4 overflow-hidden">
                    <h4 className="font-Plus-Jakarta-Sans font-normal text-lg text-(--primary-text) capitalize mb-2">map:</h4>
                    <ShipmentMap 
                        mode="selection"
                        reset={true}
                        onSelectOrigin={(value) => setForm({ ...form, origin: value })}
                        onSelectDestination={(value) => setForm({ ...form, destination: value })}
                    />
                    <button onClick={(): void => setOpenMap(false)} className="absolute w-8 h-8 flex items-center justify-center top-0 right-0 duration-300 bg-red-500/50 hover:bg-red-500 cursor-pointer text-(--primary-text)">
                        <PiX className="text-xl" />
                    </button>
                </div>
            ) }
        </div>
    )
}


export default AddShipmentForm;