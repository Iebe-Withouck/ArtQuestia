import {
    Viro3DObject,
    ViroAmbientLight,
    ViroARScene,
    ViroARSceneNavigator,
    ViroDirectionalLight,
    ViroNode,
    ViroText,
} from '@reactvision/react-viro';
import * as Location from 'expo-location';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Animated,
    TouchableOpacity,
    Image,
    Text,
    ScrollView,
    Dimensions
} from 'react-native';

const STRAPI_URL = 'http://172.30.21.177:1337';
const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Calculate bearing between two GPS coordinates
const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const toDeg = (rad: number) => rad * (180 / Math.PI);

    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

    return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

// Calculate distance between two GPS coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

// Convert GPS coordinates to AR position relative to user
const gpsToARPosition = (
    userLat: number,
    userLon: number,
    targetLat: number,
    targetLon: number
): [number, number, number] => {
    const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
    const bearing = calculateBearing(userLat, userLon, targetLat, targetLon);

    // Convert bearing to radians
    const bearingRad = (bearing * Math.PI) / 180;

    // Scale down the distance for AR (1 meter real = 0.01 AR units for better visibility)
    const scaleFactor = 0.01;
    const scaledDistance = distance * scaleFactor;

    // Calculate x, z positions with scaled distance
    const x = scaledDistance * Math.sin(bearingRad);
    const z = -scaledDistance * Math.cos(bearingRad);

    // Set y to -0.5 to place object at chest/eye level
    const y = -0.5;

    return [x, y, z];
};

interface ARScene3Props {
    userLocation: Location.LocationObject | null;
    sceneKey: number;
}

// Internal AR Scene Component
function ARScene3Scene({ userLocation, targetLatitude, targetLongitude }: {
    userLocation: Location.LocationObject | null;
    targetLatitude: number;
    targetLongitude: number;
}) {
    // Calculate AR position based on GPS coordinates
    const arPosition: [number, number, number] = userLocation
        ? gpsToARPosition(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            targetLatitude,
            targetLongitude
        )
        : [0, -0.4, -2]; // Default position if no GPS

    const distance = userLocation
        ? calculateDistance(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            targetLatitude,
            targetLongitude
        )
        : 0;

    return (
        <ViroARScene>
            {/* Ambient light for overall scene illumination */}
            <ViroAmbientLight color="#ffffff" intensity={30000} />

            {/* Directional light from above-front to simulate sunlight */}
            <ViroDirectionalLight
                color="#ffffff"
                direction={[0, -1, -0.5]}
                intensity={500}
            />

            {/* Additional directional light from the side for depth */}
            <ViroDirectionalLight
                color="#ffffff"
                direction={[1, -0.5, 0]}
                intensity={300}
            />

            {/* Node to group and anchor all objects at GPS coordinates */}
            <ViroNode
                position={arPosition}
                dragType="FixedToWorld"
            >
                {/* Distance indicator text */}
                <ViroText
                    text={`${Math.round(distance)}m away`}
                    scale={[0.2, 0.2, 0.2]}
                    position={[0, 0.5, 0]}
                    style={styles.helloText}
                />

                {/* 3D Model with baked animation from Blender */}
                <Viro3DObject
                    source={require('../../assets/3D-Models/bomb.glb')}
                    resources={[]}
                    position={[0, 0, 0]}
                    scale={[0.1, 0.1, 0.1]}
                    type="GLB"
                    animation={{
                        name: 'BombAction',
                        run: true,
                        loop: true,
                    }}
                    lightReceivingBitMask={1}
                    shadowCastingBitMask={1}
                    onLoadStart={() => console.log('ARScene3: Bomb loading...')}
                    onLoadEnd={() => console.log('ARScene3: Bomb loaded at GPS coordinates')}
                    onError={(event) => {
                        console.error('ARScene3: Error loading bomb (message):', event.nativeEvent?.error);
                        console.error(
                            'ARScene3: Full error object:',
                            JSON.stringify(event.nativeEvent, null, 2),
                        );
                    }}
                />
            </ViroNode>
        </ViroARScene>
    );
}

// Main Component with Menu
export default function ARScene3({ userLocation, sceneKey }: ARScene3Props) {
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);
    const [menuHeight] = useState(new Animated.Value(verticalScale(120)));
    const [artworkData, setArtworkData] = useState<any>(null);

    const [fontsLoaded] = useFonts({
        Impact: require('../../assets/fonts/impact.ttf'),
        LeagueSpartan: require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
    });

    const TARGET_LATITUDE = 50.833000;
    const TARGET_LONGITUDE = 3.265000;

    useEffect(() => {
        const fetchArtwork = async () => {
            try {
                const response = await fetch(`${STRAPI_URL}/api/artworks?populate=*`);
                const data = await response.json();

                // Try to find "Het Leiegedenkteken" with flexible matching
                const artwork = data.data?.find((artwork: any) =>
                    artwork.Name === 'Het Leiegedenkteken' ||
                    artwork.Name === 'Leiegedenkteken' ||
                    artwork.Name?.toLowerCase().includes('leiegedenkteken')
                );

                if (artwork) {
                    setArtworkData(artwork);
                } else {
                    // Fallback to first artwork if not found
                    if (data.data && data.data.length > 0) {
                        setArtworkData(data.data[0]);
                    }
                }
            } catch (error) {
                console.error('ARScene3: Error fetching artwork:', error);
            }
        };
        fetchArtwork();
    }, []);

    const toggleMenu = () => {
        const toValue = isMenuExpanded ? verticalScale(120) : verticalScale(380);
        Animated.spring(menuHeight, { toValue, useNativeDriver: false, tension: 50, friction: 7 }).start();
        setIsMenuExpanded(!isMenuExpanded);
    };

    const ARSceneWrapper = () => (
        <ARScene3Scene userLocation={userLocation} targetLatitude={TARGET_LATITUDE} targetLongitude={TARGET_LONGITUDE} />
    );

    const artwork = artworkData || {};
    const stickersUrl = artwork.Stickers?.url;
    const fullStickersUrl = stickersUrl ? `${STRAPI_URL}${stickersUrl}` : null;
    const calculatedDistance = userLocation && artwork.Location?.lat && artwork.Location?.lng
        ? (calculateDistance(userLocation.coords.latitude, userLocation.coords.longitude, artwork.Location.lat, artwork.Location.lng) / 1000).toFixed(1) : 'N/A';

    return (
        <View style={{ flex: 1 }}>
            <ViroARSceneNavigator key={sceneKey} autofocus={true} initialScene={{ scene: ARSceneWrapper }} worldAlignment="GravityAndHeading" style={{ flex: 1 }} />
            {artworkData && fontsLoaded && (
                <Animated.View style={[styles.bottomMenu, { height: menuHeight, backgroundColor: '#000' }]}>
                    <TouchableOpacity style={styles.toggleButton} onPress={toggleMenu} activeOpacity={0.8}>
                        <Image source={require('../../assets/icons/arrow2.png')} style={[styles.toggleIcon, { transform: [{ rotate: isMenuExpanded ? '0deg' : '180deg' }] }]} />
                    </TouchableOpacity>
                    <View style={styles.collapsedContent}>
                        {fullStickersUrl && <Image source={{ uri: fullStickersUrl }} style={styles.stickerImage} />}
                        <View style={styles.textContent}>
                            <Text style={[styles.artworkName, { fontFamily: 'Impact' }]}>{artwork.Name || 'Untitled'}</Text>
                            <Text style={[styles.creatorName, { fontFamily: 'LeagueSpartan-regular' }]}>{artwork.Creator || 'Unknown'}</Text>
                        </View>
                    </View>
                    {isMenuExpanded && (
                        <ScrollView style={styles.expandedContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.infoButtonsRow}>
                                <TouchableOpacity style={styles.buttonContainer}>
                                    <Text style={[styles.buttonIcon, { fontFamily: 'Impact' }]}>Jaar</Text>
                                    <View style={styles.button}><Text style={[styles.buttonText, { fontFamily: 'LeagueSpartan-regular' }]}>{artwork.Year || 'N/A'}</Text></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonContainer}>
                                    <Text style={[styles.buttonIcon, { fontFamily: 'Impact' }]}>Locatie</Text>
                                    <View style={styles.button}><Text style={[styles.buttonText, { fontFamily: 'LeagueSpartan-regular' }]}>{calculatedDistance} km</Text></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonContainer}>
                                    <Text style={[styles.buttonIcon, { fontFamily: 'Impact' }]}>Thema</Text>
                                    <View style={styles.button}><Text style={[styles.buttonText, { fontFamily: 'LeagueSpartan-regular' }]}>{artwork.Theme || 'N/A'}</Text></View>
                                </TouchableOpacity>
                            </View>
                            {artwork.Description && (
                                <View style={styles.descriptionContainer}>
                                    <Text style={[styles.description, { fontFamily: 'LeagueSpartan-regular' }]}>{artwork.Description}</Text>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    helloText: { fontSize: 30, color: '#ffffff', textAlignVertical: 'center', textAlign: 'center' },
    bottomMenu: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: moderateScale(30), borderTopRightRadius: moderateScale(30), paddingHorizontal: scale(20), paddingTop: verticalScale(20), paddingBottom: verticalScale(20), shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
    toggleButton: { position: 'absolute', top: verticalScale(-25), left: '55%', transform: [{ translateX: -moderateScale(25) }], width: moderateScale(50), height: moderateScale(50), borderRadius: moderateScale(25), backgroundColor: '#FF7700', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5, zIndex: 100 },
    toggleIcon: { width: moderateScale(20), height: moderateScale(20), resizeMode: 'contain', tintColor: '#fff' },
    collapsedContent: { flexDirection: 'row', alignItems: 'center', paddingTop: verticalScale(10) },
    stickerImage: { width: moderateScale(70), height: moderateScale(70), resizeMode: 'contain', marginRight: scale(15) },
    textContent: { flex: 1, justifyContent: 'center' },
    artworkName: { fontSize: moderateScale(22), color: '#fff', marginBottom: verticalScale(5) },
    creatorName: { fontSize: moderateScale(16), color: '#fff', opacity: 0.9 },
    expandedContent: { marginTop: verticalScale(20) },
    infoButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: verticalScale(20), marginBottom: verticalScale(20) },
    buttonContainer: { alignItems: 'center', position: 'relative', flex: 1, maxWidth: scale(100), marginHorizontal: scale(0) },
    buttonIcon: { width: moderateScale(100), height: moderateScale(100), position: 'absolute', top: verticalScale(-5), zIndex: 10, color: '#fff', fontSize: moderateScale(20), textAlign: 'center' },
    button: { width: '100%', paddingVertical: verticalScale(10), borderRadius: moderateScale(14), justifyContent: 'center', alignItems: 'center', marginTop: verticalScale(8), backgroundColor: '#292929', paddingTop: verticalScale(20), minHeight: verticalScale(70) },
    buttonText: { color: '#fff', fontSize: moderateScale(15), textAlign: 'center' },
    descriptionContainer: { marginBottom: verticalScale(30), marginTop: verticalScale(10) },
    description: { fontSize: moderateScale(15), color: '#fff', lineHeight: moderateScale(22) },
});
