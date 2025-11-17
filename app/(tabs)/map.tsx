import { IconSymbol } from '@/components/ui/icon-symbol';
import {
    Camera,
    MapView,
    UserLocation,
    type CameraRef,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MapScreen() {
    const center: [number, number] = [4.3517, 50.8503];

    const styleUrl =
        "https://api.maptiler.com/maps/019a91f5-7a01-7170-a11e-6df34c588725/style.json?key=mIqAbQiXcMAwOt3f0O2W";

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [userCoord, setUserCoord] = useState<[number, number] | null>(null);
    const cameraRef = useRef<CameraRef>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
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
                <UserLocation visible={true} />

                <Camera
                    ref={cameraRef}
                    centerCoordinate={userCoord ?? center}
                    zoomLevel={userCoord ? 17 : 12}
                    pitch={60}
                    heading={20}
                />
            </MapView>

            {/* Floating button met IconSymbol */}
            <TouchableOpacity style={styles.locationBtn} onPress={goToMyLocation}>
                <IconSymbol
                    name="location.fill"
                    size={28}
                    color="white"
                />
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