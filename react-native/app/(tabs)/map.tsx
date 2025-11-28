import { IconSymbol } from "@/components/ui/icon-symbol";
import {
    Camera,
    LineLayer,
    MapView,
    MarkerView,
    ShapeSource,
    UserLocation,
    type CameraRef,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const STRAPI_URL = 'http://172.30.40.49:1337';

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
    creator: string;
    iconUrl: string; // URL to the hidden photo from Strapi
    description?: string; // short description for the marker
};

export default function MapScreen() {
    // fallback: Kortrijk
    const center: [number, number] = [3.2649, 50.828];

    // State for artworks from database
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [loading, setLoading] = useState(true);

    // Onze MapTiler style
    const maptilerKey = "mIqAbQiXcMAwOt3f0O2W";
    const styleUrl = `https://api.maptiler.com/maps/019a91f5-7a01-7170-a11e-6df34c588725/style.json?key=${maptilerKey}`;

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [userCoord, setUserCoord] = useState<[number, number] | null>(null);
    const [routeGeoJSON, setRouteGeoJSON] = useState<any | null>(null);
    const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
    const [isRouteActive, setIsRouteActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMarkers, setFilteredMarkers] = useState<Marker[]>([]);

    const cameraRef = useRef<CameraRef>(null);

    // Fetch artworks from Strapi
    const fetchArtworks = async () => {
        try {
            const response = await fetch(`${STRAPI_URL}/api/artworks?populate=*`);
            const data = await response.json();

            if (data.error) {
                console.error('Strapi API Error:', data.error);
                setLoading(false);
                return;
            }

            if (data.data) {
                console.log('Fetched artworks:', data.data.length);

                // Transform artworks into markers
                const transformedMarkers: Marker[] = data.data
                    .filter((artwork: any) => {
                        const attributes = artwork.attributes || artwork;
                        const hasLocation = attributes.Location?.lat && attributes.Location?.lng;
                        if (!hasLocation) {
                            console.log('Artwork missing location:', attributes.Name);
                        }
                        return hasLocation;
                    })
                    .map((artwork: any) => {
                        const attributes = artwork.attributes || artwork;

                        // Handle Photo_Hidden with multiple fallbacks like ArtworkCard
                        const photoData = attributes.Photo_Hidden?.data;
                        const photoUrl = photoData?.attributes?.url || photoData?.url || attributes.Photo_Hidden?.url;
                        const fullImageUrl = photoUrl ? `${STRAPI_URL}${photoUrl}` : null;

                        console.log('Artwork:', attributes.Name);
                        console.log('Photo_Hidden structure:', JSON.stringify(attributes.Photo_Hidden, null, 2));
                        console.log('Final Photo URL:', fullImageUrl);
                        console.log('Location:', [attributes.Location.lng, attributes.Location.lat]);

                        return {
                            id: artwork.id.toString(),
                            coordinate: [attributes.Location.lng, attributes.Location.lat],
                            title: attributes.Name || 'Kunstwerk',
                            creator: attributes.Creator || 'Onbekend',
                            iconUrl: fullImageUrl,
                            description: attributes.Description || '',
                        };
                    });

                console.log('Transformed markers:', transformedMarkers.length);
                console.log('Markers:', JSON.stringify(transformedMarkers, null, 2));
                setMarkers(transformedMarkers);
            }
        } catch (error) {
            console.error('Error fetching artworks:', error);
        } finally {
            setLoading(false);
        }
    };

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
        setIsRouteActive(true);

        // Zoom naar het kunstwerk
        cameraRef.current?.setCamera({
            centerCoordinate: marker.coordinate,
            zoomLevel: 14,
            animationDuration: 1000,
        });
    };

    // Cancel route
    const cancelRoute = () => {
        setRouteGeoJSON(null);
        setIsRouteActive(false);
        setSelectedMarker(null);
    };

    // Find and show nearest artwork popup
    const goToNearestArtwork = () => {
        if (!userCoord || markers.length === 0) {
            console.warn("Geen locatie of markers beschikbaar");
            return;
        }

        // Find nearest marker
        let nearestMarker = markers[0];
        let minDistance = calculateDistance(userCoord, markers[0].coordinate);

        markers.forEach((marker) => {
            const distance = calculateDistance(userCoord, marker.coordinate);
            if (distance < minDistance) {
                minDistance = distance;
                nearestMarker = marker;
            }
        });

        // Select nearest marker to show popup
        setSelectedMarker(nearestMarker);

        // Zoom to marker with proper camera settings
        cameraRef.current?.setCamera({
            centerCoordinate: nearestMarker.coordinate,
            zoomLevel: 16,
            pitch: 60,
            animationDuration: 1000,
        });
    };

    // Calculate arrival time
    const getArrivalTime = (distanceKm: number) => {
        const walkingSpeedKmH = 5; // Average walking speed
        const durationMinutes = Math.round((distanceKm / walkingSpeedKmH) * 60);
        const now = new Date();
        now.setMinutes(now.getMinutes() + durationMinutes);
        return now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    };

    // Filter markers based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredMarkers([]);
        } else {
            const filtered = markers.filter(marker =>
                marker.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredMarkers(filtered);
        }
    }, [searchQuery, markers]);

    // Fetch artworks on mount
    useEffect(() => {
        fetchArtworks();
    }, []);

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

    // Live location tracking when route is active
    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        if (isRouteActive && selectedMarker) {
            (async () => {
                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 5000, // Update every 5 seconds
                        distanceInterval: 10, // Update every 10 meters
                    },
                    (location) => {
                        const coord: [number, number] = [
                            location.coords.longitude,
                            location.coords.latitude,
                        ];
                        setUserCoord(coord);

                        // Update route if needed
                        fetchWalkingRoute(coord, selectedMarker.coordinate);
                    }
                );
            })();
        }

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [isRouteActive, selectedMarker]);

    const goToMyLocation = async () => {
        try {
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
            if (selectedMarker && isRouteActive) {
                await fetchWalkingRoute(coord, selectedMarker.coordinate);
            }
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    // Handle search result click
    const handleSearchResultClick = (marker: Marker) => {
        setSearchQuery('');
        setFilteredMarkers([]);
        setSelectedMarker(marker);

        cameraRef.current?.setCamera({
            centerCoordinate: marker.coordinate,
            zoomLevel: 16,
            pitch: 60,
            animationDuration: 1000,
        });
    };

    if (hasPermission === false) {
        return (
            <View style={styles.center}>
                <Text>Locatie-permissie is geweigerd</Text>
            </View>
        );
    }

    if (hasPermission === null || loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text>Locatie ophalen…</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                mapStyle={styleUrl}
                compassEnabled={false}
            >
                {/* native user dot */}
                <UserLocation visible={true} />

                {/* Custom Markers with hidden images */}
                {markers.map((marker) => (
                    <MarkerView
                        key={marker.id}
                        coordinate={marker.coordinate}
                    >
                        <TouchableOpacity
                            onPress={() => setSelectedMarker(marker)}
                            style={{
                                width: 60,
                                height: 60,
                                backgroundColor: '#FF5AE5',
                                borderRadius: 30,
                                borderWidth: 3,
                                borderColor: '#FFFFFF',
                                overflow: 'hidden',
                                justifyContent: 'center',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 5,
                            }}
                        >
                            {marker.iconUrl ? (
                                <Image
                                    source={{ uri: marker.iconUrl }}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={{ width: 30, height: 30, backgroundColor: '#FFF', borderRadius: 15 }} />
                            )}
                        </TouchableOpacity>
                    </MarkerView>
                ))}

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
                    defaultSettings={{
                        centerCoordinate: userCoord ?? center,
                        zoomLevel: userCoord ? 17 : 12,
                        pitch: 60,
                        heading: 20,
                    }}
                />
            </MapView>

            {/* Search bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="Zoek naar kunstwerken"
                    placeholderTextColor="#666666"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <View style={styles.searchButton}>
                    <Image
                        source={require('@/assets/icons/search.png')}
                        style={styles.searchIcon}
                    />
                </View>
            </View>

            {/* Search results dropdown */}
            {filteredMarkers.length > 0 && (
                <View style={styles.searchResultsContainer}>
                    <FlatList
                        data={filteredMarkers}
                        keyExtractor={(item) => item.id}
                        style={styles.searchResultsList}
                        renderItem={({ item }) => {
                            const distance = userCoord
                                ? calculateDistance(userCoord, item.coordinate)
                                : null;
                            return (
                                <TouchableOpacity
                                    style={styles.searchResultItem}
                                    onPress={() => handleSearchResultClick(item)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.searchResultTextContainer}>
                                        <Text style={styles.searchResultTitle}>{item.title}</Text>
                                        <Text style={styles.searchResultDistance}>
                                            {distance ? `${distance.toFixed(1)} km` : 'Afstand onbekend'}
                                        </Text>
                                    </View>
                                    <View style={styles.searchResultArrow}>
                                        <Image
                                            source={require('@/assets/images/arrownavigation.png')}
                                            style={styles.searchResultArrowImage}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            )}

            {/* Floating button: ga naar mijn locatie + route herberekenen */}
            <TouchableOpacity
                style={styles.locationBtn}
                onPress={goToMyLocation}
            >
                <IconSymbol name="location.fill" size={28} color="white" />
            </TouchableOpacity>

            {/* Bottom action buttons */}
            {!isRouteActive && (
                <View style={styles.bottomButtonsContainer}>
                    <TouchableOpacity
                        style={styles.nearestButton}
                        onPress={goToNearestArtwork}
                    >
                        <Text style={styles.bottomButtonText}>Dichtstbijzijnde</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.followRouteButton}
                        onPress={() => console.log("Volg een route")}
                    >
                        <Text style={styles.bottomButtonText}>Volg een route</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Popup onderaan bij geselecteerd kunstwerk */}
            {selectedMarker && !isRouteActive && (
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
                            {selectedMarker.iconUrl ? (
                                <Image
                                    source={{ uri: selectedMarker.iconUrl }}
                                    style={styles.popupImage}
                                    resizeMode="contain"
                                />
                            ) : (
                                <Text style={{ color: '#fff' }}>No Image</Text>
                            )}
                        </View>

                        {/* Right side: Text content + button */}
                        <View style={styles.popupRightContent}>
                            <View style={styles.popupTextContainer}>
                                <Text style={styles.popupTitle}>
                                    {selectedMarker.title || "Kunstwerk"}
                                </Text>
                                <Text style={styles.popupSubtitle}>
                                    {selectedMarker.creator || "Onbekend"}
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

            {/* Route navigation popup - shown when route is active */}
            {isRouteActive && selectedMarker && routeGeoJSON && (
                <View style={styles.routePopupContainer}>
                    <View style={styles.routePopupCard}>
                        {/* Left side: Green arrow with distance */}
                        <View style={styles.routeArrowContainer}>
                            <Text style={styles.routeDistanceText}>
                                {userCoord ? Math.round(calculateDistance(userCoord, selectedMarker.coordinate) * 1000) : 0}m
                            </Text>
                            <Image
                                source={require('@/assets/images/arrownavigation.png')}
                                style={styles.routeArrowImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Right side: Content */}
                        <View style={styles.routeContentContainer}>
                            {/* Title and description */}
                            <View>
                                <Text style={styles.routeTitle}>
                                    {selectedMarker.title || "Kunstwerk"}
                                </Text>
                                <Text style={styles.routeSubtitle}>
                                    {selectedMarker.creator || "Onbekend"}
                                </Text>
                            </View>

                            {/* Info icons */}
                            <View style={styles.routeInfoSection}>
                                {/* Labels Row */}
                                <View style={styles.routeLabelsRow}>
                                    <Text style={styles.routeInfoLabel}>Aankomst</Text>
                                    <Text style={styles.routeInfoLabel}>Afstand</Text>
                                    <Text style={styles.routeInfoLabel}>Annuleer</Text>
                                </View>

                                {/* Icons Row */}
                                <View style={styles.routeIconsRow}>
                                    <View style={styles.routeIconCircle}>
                                        <Image
                                            source={require("@/assets/icons/clock.png")}
                                            style={styles.routeIcon}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <View style={styles.routeIconCircle}>
                                        <Image
                                            source={require("@/assets/icons/distance.png")}
                                            style={styles.routeIcon}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.routeCancelCircle}
                                        onPress={cancelRoute}
                                    >
                                        <Image
                                            source={require("@/assets/icons/cancel.png")}
                                            style={styles.routeCancelIcon}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Values Row */}
                                <View style={styles.routeValuesRow}>
                                    <Text style={styles.routeInfoValue}>
                                        {userCoord ? getArrivalTime(calculateDistance(userCoord, selectedMarker.coordinate)) : "--"}
                                    </Text>
                                    <Text style={styles.routeInfoValue}>
                                        {userCoord ? calculateDistance(userCoord, selectedMarker.coordinate) : "--"} km
                                    </Text>
                                    <View style={styles.routeInfoValuePlaceholder} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
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
        right: 80,
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
    searchInput: {
        flex: 1,
        paddingLeft: 15,
        fontSize: 15,
        color: "#000",
        fontFamily: "LeagueSpartan-regular",
    },
    searchButton: {
        width: 50,
        backgroundColor: "#FF7700",
        justifyContent: "center",
        alignItems: "center",
    },
    searchIcon: {
        width: 18,
        height: 18,
        tintColor: "#fff",
    },
    searchResultsContainer: {
        position: "absolute",
        top: 115,
        left: 20,
        right: 20,
        maxHeight: 300,
        backgroundColor: "#fff",
        borderRadius: 16,
        zIndex: 9,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchResultsList: {
        maxHeight: 300,
    },
    searchResultItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        width: "100%",
    },
    searchResultTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    searchResultTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginBottom: 4,
        fontFamily: "LeagueSpartan-regular",
    },
    searchResultDistance: {
        fontSize: 14,
        color: "#000000",
        fontFamily: "LeagueSpartan-regular",
    },
    searchResultArrow: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1AF7A2",
        justifyContent: "center",
        alignItems: "center",
    },
    searchResultArrowImage: {
        width: 20,
        height: 20,
    },
    locationBtn: {
        position: "absolute",
        top: 60,
        right: 24,
        backgroundColor: "#292929",
        padding: 12,
        borderRadius: 50,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },

    // Bottom buttons
    bottomButtonsContainer: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 40,
        flexDirection: "row",
        gap: 12,
    },
    nearestButton: {
        flex: 1,
        backgroundColor: "#215AFF",
        paddingVertical: 18,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    followRouteButton: {
        flex: 1,
        backgroundColor: "#FF7700",
        paddingVertical: 18,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    bottomButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "Impact",
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
        backgroundColor: "#FF5AE5",
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
        fontFamily: "Impact",
    },
    popupSubtitle: {
        fontSize: 16,
        color: "#FFFFFF",
        marginBottom: 8,
        fontFamily: "LeagueSpartan-medium",
    },
    popupDistance: {
        fontSize: 14,
        color: "#FFFFFF",
        marginTop: 4,
        fontFamily: "LeagueSpartan-regular",
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
        fontFamily: "Impact",
    },

    // Route navigation popup styles
    routePopupContainer: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 24,
    },
    routePopupCard: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        overflow: "hidden",
        flexDirection: "row",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        minHeight: 180,
    },
    routeArrowContainer: {
        width: 120,
        backgroundColor: "#1AF7A2",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
    },
    routeDistanceText: {
        fontSize: 26,
        fontWeight: "700",
        color: "#000",
        marginBottom: 20,
        fontFamily: "LeagueSpartan-semi-bold",
    },
    routeArrowImage: {
        width: 90,
        height: 90,
    },
    routeContentContainer: {
        flex: 1,
        padding: 16,
        justifyContent: "space-between",
    },
    routeTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
        marginBottom: 2,
        fontFamily: "LeagueSpartan-semi-bold",
    },
    routeSubtitle: {
        fontSize: 14,
        color: "#000000",
        marginBottom: 8,
        fontFamily: "LeagueSpartan-medium",
    },
    routeInfoSection: {
        marginTop: 4,
    },
    routeLabelsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 8,
    },
    routeInfoLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#000",
        flex: 1,
        textAlign: "center",
        fontFamily: "LeagueSpartan-semibold",
    },
    routeIconsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 6,
    },
    routeIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#FDE404",
        justifyContent: "center",
        alignItems: "center",
    },
    routeCancelCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#F10906",
        justifyContent: "center",
        alignItems: "center",
    },
    routeIcon: {
        width: 32,
        height: 32,
    },
    routeCancelIcon: {
        width: 28,
        height: 28,
    },
    routeValuesRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 8,
    },
    routeInfoValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
        flex: 1,
        textAlign: "center",
        fontFamily: "LeagueSpartan-regular",
    },
    routeInfoValuePlaceholder: {
        flex: 1,
    },
});