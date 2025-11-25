import { IconSymbol } from "@/components/ui/icon-symbol";
import {
    Camera,
    Images,
    LineLayer,
    MapView,
    ShapeSource,
    SymbolLayer,
    UserLocation,
    type CameraRef,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Type for markers
type Marker = {
    id: string;
    coordinate: [number, number]; // [longitude, latitude]
    title: string;
    icon?: string; // icon name reference for custom icons
};

export default function MapScreen() {
    // fallback: Kortrijk
    const center: [number, number] = [3.2649, 50.828];

    // Markers array - Add your coordinates here
    const [markers, setMarkers] = useState<Marker[]>([
        {
            id: "oorlogsmonument_bissegem",
            coordinate: [3.227223, 50.823085],
            title: "",
            icon: "marker-icon1",
        },
        {
            id: "leie_monument",
            coordinate: [3.268430, 50.835340],
            title: "",
            icon: "marker-icon2",
        },
        {
            id: "groeninge_monument",
            coordinate: [3.275814, 50.828708],
            title: "",
            icon: "marker-icon3",
        },
        {
            id: "monument_voor_de_gesneuvelden_van_wereldoorlog_ii",
            coordinate: [3.265759, 50.827542],
            title: "",
            icon: "marker-icon4",
        },
    ]);

    // Onze MapTiler style
    const maptilerKey = "mIqAbQiXcMAwOt3f0O2W";
    const styleUrl = `https://api.maptiler.com/maps/019a91f5-7a01-7170-a11e-6df34c588725/style.json?key=${maptilerKey}`;

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [userCoord, setUserCoord] = useState<[number, number] | null>(null);
    const [routeGeoJSON, setRouteGeoJSON] = useState<any | null>(null);
    const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);

    const cameraRef = useRef<CameraRef>(null);

    // OpenRouteService
    const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNjNDUyZGVlMzNmMzQ3N2RhMTNiNTFmOWU5MGIwYjYzIiwiaCI6Im11cm11cjY0In0=";

    // Fetch route to a specific marker (ready for future implementation)
    const fetchWalkingRoute = async (
        startCoord: [number, number],
        endCoord: [number, number]
    ) => {
        try {
            const res = await fetch(
                "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                        Accept: "application/geo+json, application/json",
                        Authorization: ORS_API_KEY,
                    },
                    body: JSON.stringify({
                        coordinates: [startCoord, endCoord],
                    }),
                }
            );

            if (!res.ok) {
                console.warn("ORS route request failed", await res.text());
                return;
            }

            const json = await res.json();
            console.log("Route GeoJSON:", JSON.stringify(json, null, 2));
            setRouteGeoJSON(json);
        } catch (e) {
            console.warn("Error fetching ORS walking route", e);
        }
    };

    // Function to navigate to a marker (ready for future routing implementation)
    const navigateToMarker = async (marker: Marker) => {
        if (!userCoord) return;
        setSelectedMarker(marker);
        await fetchWalkingRoute(userCoord, marker.coordinate);

        // Zoom to show both user and marker
        cameraRef.current?.setCamera({
            centerCoordinate: marker.coordinate,
            zoomLevel: 14,
            animationDuration: 1000,
        });
    };

    // Convert markers to GeoJSON for rendering
    const getMarkersGeoJSON = () => {
        return {
            type: "FeatureCollection",
            features: markers.map((marker) => ({
                type: "Feature",
                id: marker.id,
                properties: {
                    title: marker.title,
                    icon: marker.icon || "marker-icon",
                },
                geometry: {
                    type: "Point",
                    coordinates: marker.coordinate,
                },
            })),
        };
    };

    useEffect(() => {
        (async () => {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setHasPermission(false);
                return;
            }

            setHasPermission(true);

            const loc = await Location.getCurrentPositionAsync({});
            const coord: [number, number] = [
                loc.coords.longitude,
                loc.coords.latitude,
            ];
            setUserCoord(coord);

            // Camera naar gebruiker
            cameraRef.current?.setCamera({
                centerCoordinate: coord,
                zoomLevel: 16,
                pitch: 60,
                animationDuration: 1000,
            });

            // You can enable this to show route to first marker on load
            // if (markers.length > 0) {
            //     await fetchWalkingRoute(coord, markers[0].coordinate);
            // }
        })();
    }, []);

    const goToMyLocation = async () => {
        const loc = await Location.getCurrentPositionAsync({});
        const coord: [number, number] = [
            loc.coords.longitude,
            loc.coords.latitude,
        ];

        setUserCoord(coord);

        cameraRef.current?.setCamera({
            centerCoordinate: coord,
            zoomLevel: 16,
            pitch: 60,
            animationDuration: 800,
        });

        // Route opnieuw berekenen als er een marker geselecteerd is
        if (selectedMarker) {
            await fetchWalkingRoute(coord, selectedMarker.coordinate);
        }
    };

    if (hasPermission === false) {
        return (
            <View style={styles.center}>
                <Text>Locatie-permissie is geweigerd</Text>
            </View>
        );
    }

    if (hasPermission === null) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text>Locatie ophalen…</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView style={styles.map} mapStyle={styleUrl}>
                {/* Place your custom marker icons here
                    Example: <Images images={{ 'marker-icon': require('@/assets/icons/marker.png') }} />
                    You can add multiple icons for different marker types
                */}
                <Images
                    images={{
                        'marker-icon1': require('@/assets/icons/oorlogsmonument_bissegem.png'),
                        'marker-icon2': require('@/assets/icons/oorlogsmonument_bissegem.png'),
                        'marker-icon3': require('@/assets/icons/oorlogsmonument_bissegem.png'),
                        'marker-icon4': require('@/assets/icons/oorlogsmonument_bissegem.png'),
                    }}
                />

                {/* native user dot */}
                <UserLocation visible={true} />

                {/* Custom Markers */}
                {markers.length > 0 && (
                    <ShapeSource
                        id="markers-source"
                        shape={getMarkersGeoJSON() as any}
                    >
                        <SymbolLayer
                            id="markers-layer"
                            style={{
                                iconImage: ["get", "icon"],
                                iconSize: 0.05,
                                iconAllowOverlap: true,
                                iconIgnorePlacement: true,
                                // For default pins if no custom icon is loaded:
                                textField: ["get", "title"],
                                textSize: 12,
                                textOffset: [0, 1.5],
                                textAnchor: "top",
                                textColor: "#000000",
                                textHaloColor: "#ffffff",
                                textHaloWidth: 2,
                            }}
                        />
                    </ShapeSource>
                )}

                {/* wandelroute user → selected marker (volgt straten) */}
                {routeGeoJSON && (
                    <ShapeSource id="walking-route" shape={routeGeoJSON as any}>
                        <LineLayer
                            id="walking-route-line"
                            style={{
                                lineColor: "#215AFF", // blauw
                                lineWidth: 4,
                                lineCap: "round",
                                lineJoin: "round",
                            }}
                        />
                    </ShapeSource>
                )}

                <Camera
                    ref={cameraRef}
                    centerCoordinate={userCoord ?? center}
                    zoomLevel={userCoord ? 17 : 12}
                    pitch={60}
                    heading={20}
                />
            </MapView>

            {/* Floating button: ga naar mijn locatie + route herberekenen */}
            <TouchableOpacity style={styles.locationBtn} onPress={goToMyLocation}>
                <IconSymbol name="location.fill" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    locationBtn: {
        position: "absolute",
        bottom: 24,
        right: 24,
        backgroundColor: "#292929",
        padding: 12,
        borderRadius: 50,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
});