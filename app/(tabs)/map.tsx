import { IconSymbol } from "@/components/ui/icon-symbol";
import {
    Camera,
    LineLayer,
    MapView,
    ShapeSource,
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

export default function MapScreen() {
    // fallback: Brussel
    const center: [number, number] = [4.3517, 50.8503];

    // Centrum Kortrijk
    const kortrijkCenter: [number, number] = [3.2649, 50.828];

    // Onze MapTiler style
    const maptilerKey = "mIqAbQiXcMAwOt3f0O2W";
    const styleUrl = `https://api.maptiler.com/maps/019a91f5-7a01-7170-a11e-6df34c588725/style.json?key=${maptilerKey}`;

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [userCoord, setUserCoord] = useState<[number, number] | null>(null);
    const [routeGeoJSON, setRouteGeoJSON] = useState<any | null>(null);

    const cameraRef = useRef<CameraRef>(null);

    // OpenRouteService
    const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNjNDUyZGVlMzNmMzQ3N2RhMTNiNTFmOWU5MGIwYjYzIiwiaCI6Im11cm11cjY0In0=";

    const fetchWalkingRoute = async (startCoord: [number, number]) => {
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
                        coordinates: [startCoord, kortrijkCenter],
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

            // Wandelroute user → Kortrijk
            await fetchWalkingRoute(coord);
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

        // Route opnieuw berekenen vanaf nieuwe positie
        await fetchWalkingRoute(coord);
    };

    if (hasPermission === false) {
        return (
            <View style={styles.center}>
                <Text>Locatie-permissie is geweigerd 😢</Text>
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
                {/* native user dot */}
                <UserLocation visible={true} />

                {/* wandelroute user → Kortrijk (volgt straten) */}
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