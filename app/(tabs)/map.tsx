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
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";


// Image mapping for markers
const markerImages: { [key: string]: any } = {
    "marker-icon1": require("@/assets/icons/oorlogsmonument_bissegem.png"),
    "marker-icon2": require("@/assets/icons/leie_monument.png"),
    "marker-icon3": require("@/assets/icons/groeninge_monument.png"),
    "marker-icon4": require("@/assets/icons/monument_voor_de_gesneuvelden_van_wereldoorlog_ii.png"),
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (
    coord1: [number, number],
    coord2: [number, number]
): number => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal
};

// Type for markers
type Marker = {
    id: string;
    coordinate: [number, number]; // [longitude, latitude]
    title: string;
    icon?: string; // icon name reference for custom icons
    description?: string; // short description for the marker
};

export default function MapScreen() {
    // fallback: Kortrijk
    const center: [number, number] = [3.2649, 50.828];

    // Markers array - Add your coordinates here
    const [markers, setMarkers] = useState<Marker[]>([
        {
            id: "oorlogsmonument_bissegem",
            coordinate: [3.227223, 50.823085],
            title: "Oorlogsmonument Bissegem",
            icon: "marker-icon1",
            description: "Viane-Lagae",
        },
        {
            id: "leie_monument",
            coordinate: [3.268430, 50.835340],
            title: "Leie Monument",
            icon: "marker-icon2",
            description: "Courtens, Alfred",
        },
        {
            id: "groeninge_monument",
            coordinate: [3.275814, 50.828708],
            title: "Groeninge Monument",
            icon: "marker-icon3",
            description: "Devreese, Godfried",
        },
        {
            id: "monument_voor_de_gesneuvelden_van_wereldoorlog_ii",
            coordinate: [3.265759, 50.827542],
            title: "WO II Monument",
            icon: "marker-icon4",
            description: "Geoffroy de Montpellier",
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
    const ORS_API_KEY =
        "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNjNDUyZGVlMzNmMzQ3N2RhMTNiNTFmOWU5MGIwYjYzIiwiaCI6Im11cm11cjY0In0=";

    // Fetch route to a specific marker
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

    // Navigate to a specific marker + route tekenen
    const navigateToMarker = async (marker: Marker) => {
        if (!userCoord) {
            console.warn("Geen user locatie beschikbaar");
            return;
        }

        setSelectedMarker(marker);
        await fetchWalkingRoute(userCoord, marker.coordinate);

        // Zoom naar het kunstwerk
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
                    id: marker.id, // belangrijk om het later terug te vinden
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

    // Click handler voor markers
    const onMarkerPress = (e: any) => {
        const feature = e.features?.[0];
        if (!feature) return;

        const markerId =
            feature.properties?.id ?? feature.id;

        if (!markerId) return;

        const marker = markers.find((m) => m.id === markerId);
        if (!marker) return;

        setSelectedMarker(marker);
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
            {/* Search bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="Zoek naar kunstwerken"
                    placeholderTextColor="#666666"
                    style={styles.input}
                />
            </View>

            <MapView
                style={styles.map}
                mapStyle={styleUrl}
                compassEnabled={false}
            >
                <Images
                    images={{
                        "marker-icon1": require("@/assets/icons/oorlogsmonument_bissegem.png"),
                        "marker-icon2": require("@/assets/icons/leie_monument.png"),
                        "marker-icon3": require("@/assets/icons/groeninge_monument.png"),
                        "marker-icon4": require("@/assets/icons/monument_voor_de_gesneuvelden_van_wereldoorlog_ii.png"),
                    }}
                />

                {/* native user dot */}
                <UserLocation visible={true} />

                {/* Custom Markers */}
                {markers.length > 0 && (
                    <ShapeSource
                        id="markers-source"
                        shape={getMarkersGeoJSON() as any}
                        onPress={onMarkerPress}
                    >
                        <SymbolLayer
                            id="markers-layer"
                            style={{
                                iconImage: ["get", "icon"],
                                iconSize: 0.05,
                                iconAllowOverlap: true,
                                iconIgnorePlacement: true,
                            }}
                        />
                    </ShapeSource>
                )}

                {/* wandelroute user → selected marker (volgt straten) */}
                {routeGeoJSON && (
                    <ShapeSource
                        id="walking-route"
                        shape={routeGeoJSON as any}
                    >
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
            <TouchableOpacity
                style={styles.locationBtn}
                onPress={goToMyLocation}
            >
                <IconSymbol name="location.fill" size={28} color="white" />
            </TouchableOpacity>

            {/* Popup onderaan bij geselecteerd kunstwerk */}
            {selectedMarker && (
                <Pressable
                    style={styles.popupContainer}
                    onPress={() => setSelectedMarker(null)}
                >
                    <Pressable
                        style={styles.popupCard}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Left side: Image with pink background - full height */}
                        <View style={styles.popupImageContainer}>
                            <Image
                                source={markerImages[selectedMarker.icon || 'marker-icon1']}
                                style={styles.popupImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Right side: Text content + button */}
                        <View style={styles.popupRightContent}>
                            <View style={styles.popupTextContainer}>
                                <Text style={styles.popupTitle}>
                                    {selectedMarker.title || "Kunstwerk"}
                                </Text>
                                <Text style={styles.popupSubtitle}>
                                    {selectedMarker.description || "Kunstenaar"}
                                </Text>
                                <Text style={styles.popupDistance}>
                                    Afstand: {userCoord ? calculateDistance(userCoord, selectedMarker.coordinate) : "--"} km
                                </Text>
                            </View>

                            {/* Ontdek button on the right */}
                            <TouchableOpacity
                                style={styles.popupPrimaryButton}
                                onPress={() => navigateToMarker(selectedMarker)}
                            >
                                <Text style={styles.popupPrimaryText}>
                                    Ontdek
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            )}
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
    searchContainer: {
        position: "absolute",
        top: 60,
        left: 20,
        right: 20,
        flexDirection: "row",
        height: 45,
        backgroundColor: "#fff",
        borderRadius: 30,
        overflow: "hidden",
        zIndex: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    input: {
        flex: 1,
        paddingLeft: 15,
        fontSize: 15,
        color: "#000",
        fontFamily: "LeagueSpartan",
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

    // Popup styles
    popupContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    popupCard: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#000000",
        borderRadius: 24,
        overflow: "hidden",
        flexDirection: "row",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    popupImageContainer: {
        width: 150,
        height: 180,
        backgroundColor: "#FF00FF",
        justifyContent: "center",
        alignItems: "center",
    },
    popupImage: {
        width: "80%",
        height: "80%",
    },
    popupRightContent: {
        flex: 1,
        padding: 16,
        justifyContent: "space-between",
    },
    popupTextContainer: {
        flex: 1,
        justifyContent: "center",
    },
    popupTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 4,
        color: "#FFFFFF",
    },
    popupSubtitle: {
        fontSize: 16,
        color: "#CCCCCC",
        marginBottom: 8,
    },
    popupDistance: {
        fontSize: 14,
        color: "#FFFFFF",
        marginTop: 4,
    },
    popupPrimaryButton: {
        backgroundColor: "#FF7700",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 999,
        alignItems: "center",
        marginTop: 12,
    },
    popupPrimaryText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
});