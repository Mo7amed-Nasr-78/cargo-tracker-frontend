import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Popup, Marker, Polyline, useMapEvents } from "react-leaflet";
import L, { LatLngExpression } from 'leaflet';
import axios from "axios";
import { PiArrowClockwise } from 'react-icons/pi';


// Fix Leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// TS Interface
interface location {
    location: string,
    coordinates: {
        lat: number,
        lng: number
    }
}

function LocationSelector({ onSelect }: { onSelect: (e: location) => void }) {
    useMapEvents({
        click: async (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            try {
                const { data } = await axios.get(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                );
                onSelect({
                    location: `${data.address.city},${data.address.country}`,
                    coordinates: {
                        lat,
                        lng
                    }
                })
            } catch (err) {
                console.log("Reverse geocoding failed", err);
                onSelect({
                    location: 'Unknown',
                    coordinates: {
                        lat,
                        lng
                    }
                })
            }
        },
    });
    return null;
}

const ShipmentMap = ({
    mode,
    origin,
    destination,
    currentLocation,
    route,
    onSelectOrigin,
    onSelectDestination,
    onSelectCurrentLocation,
    zoom,
    reset,
}: {
    mode: string,
    origin?: location,
    destination?: location,
    currentLocation?: {
        location: string,
        coordinates: {
            lat: number,
            lng: number
        },
    },
    route?: [[number, number]],
    onSelectOrigin?: ({ location, coordinates }: location) => void
    onSelectDestination?: ({ location, coordinates }: location) => void
    onSelectCurrentLocation?: ({ location, coordinates }: location) => void
    zoom?: number,
    reset?: boolean,
}) => {
    
    const [ pendingOrigin, setPendingOrigin ] = useState(origin || null);
    const [ pendingDestination, setPendingDestination ] = useState(destination || null);
    const [ pendingRoute, setPendingRoute ] = useState(route || null);
    const [ pendingCurrentLocation, setPendingCurrentLocation ] = useState(currentLocation || null);

    const center: LatLngExpression = currentLocation?
        [ currentLocation.coordinates.lat, currentLocation.coordinates.lng ]
        : origin
        ? [ origin.coordinates.lat, origin.coordinates.lng ]
        : [ 30.0444, 31.2357 ];

    const resetMap = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        setPendingOrigin(null);
        setPendingDestination(null);
        setPendingRoute(null);
    }

    // Show the route of location currently
    useEffect(() => {
        const getRoute = async () => {
            if (pendingOrigin && pendingDestination){
                const { data: { routes } } = await axios.get(`http://router.project-osrm.org/route/v1/driving/${pendingOrigin.coordinates.lng},${pendingOrigin.coordinates.lat};${pendingDestination.coordinates.lng},${pendingDestination.coordinates.lat}?overview=full&geometries=geojson`);
                setPendingRoute(routes[0].geometry.coordinates);
            }
        }
        getRoute();
    }, [pendingOrigin, pendingDestination])

    return (

        <div className="relative h-full">
            <div onClick={resetMap} className={`${reset? 'flex': 'hidden'} absolute top-2 right-2 w-8 h-8 items-center justify-center rounded-lg z-[800] border border-black cursor-pointer duration-300 ease-in-out text-(--black-color) hover:text-(--primary-color) hover:scale-90 bg-white`}>
                <PiArrowClockwise className="text-lg"/>
            </div>
            <MapContainer
                center={center}
                zoom={zoom? zoom : 6}
                scrollWheelZoom={false}
                className="relative h-full"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                {
                    mode === 'selection' && (
                        <LocationSelector
                            onSelect={(loc) => {
                                if (!pendingOrigin) {
                                    setPendingOrigin({
                                        location: loc.location,
                                        coordinates: loc.coordinates
                                    });
                                    if (onSelectOrigin) {
                                        onSelectOrigin({
                                            location: loc.location,
                                            coordinates: loc.coordinates
                                        });
                                    }
                                } else {
                                    setPendingDestination({
                                        location: loc.location,
                                        coordinates: loc.coordinates
                                    });
                                    if (onSelectDestination) {
                                        onSelectDestination({
                                            location: loc.location,
                                            coordinates: loc.coordinates
                                        });
                                    }
                                }
                            }}
                        />
                    )
                }

                {
                    mode === 'tracking' && (
                        <LocationSelector
                            onSelect={(loc) => {
                                setPendingCurrentLocation({
                                    location: loc.location,
                                    coordinates: loc.coordinates,
                                });
                                if (onSelectCurrentLocation) {
                                    onSelectCurrentLocation({
                                        location: loc.location,
                                        coordinates: loc.coordinates
                                    });
                                }
                            }}
                        />
                    )
                }

                {/* Markers */}
                {pendingOrigin && (
                    <Marker position={[pendingOrigin.coordinates.lat, pendingOrigin.coordinates.lng]}>
                        <Popup>Origin</Popup>
                    </Marker>
                )}

                {pendingDestination && (
                    <Marker position={[pendingDestination.coordinates.lat, pendingDestination.coordinates.lng]}>
                        <Popup>Destination</Popup>
                    </Marker>
                )}

                {mode === 'tracking' && pendingCurrentLocation && (
                    <Marker position={[pendingCurrentLocation.coordinates.lat, pendingCurrentLocation.coordinates.lng]}>
                        <Popup>Current Location</Popup>
                    </Marker>
                )}

                {/* Route Polyline */}
                {pendingRoute && pendingRoute?.length > 0 && (
                    <Polyline positions={pendingRoute.map((r) => [r[1], r[0]])} />
                )}

                {/* Route Polyline */}
                {route && route?.length > 0 && (
                    <Polyline positions={route.map((r) => [r[1], r[0]])} />
                )}
            </MapContainer>
        </div>

    )
}

export default ShipmentMap;