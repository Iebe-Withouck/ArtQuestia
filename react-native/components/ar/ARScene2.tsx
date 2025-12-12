import {
    Viro3DObject,
    ViroAmbientLight,
    ViroARScene,
    ViroARSceneNavigator,
    ViroDirectionalLight,
    ViroNode,
    ViroText,
    ViroBox,
    ViroAnimations,
    ViroMaterials,
    ViroQuad,
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
    Dimensions,
    Modal
} from 'react-native';
import { useClaimedStickers } from '@/contexts/ClaimedStickersContext';

const STRAPI_URL = 'https://colorful-charity-cafd22260f.strapiapp.com';
const SHOW_DEBUG = false; // Set to true to enable debug logging

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

interface ARScene2Props {
    userLocation: Location.LocationObject | null;
    sceneKey: number;
}

function ARScene2Scene({ onAnimationFinish }: {
    onAnimationFinish: () => void;
}) {
    const [animationPlayed, setAnimationPlayed] = useState(false);
    const [showBalloons, setShowBalloons] = useState(false);
    const arPosition: [number, number, number] = [0, -1.5, -3];

    return (
        <ViroARScene>
            <ViroAmbientLight color="#ffffff" intensity={20000} />
            <ViroDirectionalLight
                color="#ffffff"
                direction={[0, -1, -0.5]}
                intensity={200}
            />
            <ViroDirectionalLight
                color="#ffffff"
                direction={[1, -0.5, 0]}
                intensity={100}
            />

            <ViroNode position={arPosition} dragType="FixedToWorld">
                <Viro3DObject
                    source={require('../../assets/3D-Models/flag.glb')}
                    resources={[]}
                    position={[0, 0.5, -10]}
                    scale={[2, 2, 2]}
                    rotation={[0, -90, 0]}
                    type="GLB"
                    animation={{
                        name: 'VirginOfFlanders',
                        run: true,
                        loop: true,
                    }}
                    lightReceivingBitMask={1}
                    shadowCastingBitMask={1}
                    onLoadStart={() => console.log('ARScene2: Flag loading...')}
                    onLoadEnd={() => {
                        console.log('ARScene2: Flag loaded at fixed position');
                        setTimeout(() => {
                            setShowBalloons(true);
                        }, 2000);
                        setTimeout(() => {
                            if (!animationPlayed) {
                                setAnimationPlayed(true);
                                onAnimationFinish();
                            }
                        }, 16000);
                    }}
                    onError={(event) => {
                        console.error('ARScene2: Error loading flag (message):', event.nativeEvent?.error);
                        console.error(
                            'ARScene2: Full error object:',
                            JSON.stringify(event.nativeEvent, null, 2),
                        );
                    }}
                />

                {showBalloons && (
                    <ViroNode position={[1.2, 1.5, 0]} animation={{ name: 'fadeIn', run: true }}>
                        <ViroBox
                            position={[0, 0, 0]}
                            height={0.38}
                            width={1.1}
                            length={0.02}
                            materials={['balloonBackground']}
                        />
                        <ViroText
                            text="1906: Onthuld na 4 jaar"
                            position={[0, 0.1, 0.02]}
                            scale={[0.15, 0.15, 0.15]}
                            width={3.5}
                            height={1}
                            style={styles.balloonTitle}
                        />
                        <ViroText
                            text="Godfried Devreese wint wedstrijd. Maquette 1902; voltooid 1906. Verguld brons via Vlaamse inzameling."
                            position={[0, -0.06, 0.02]}
                            scale={[0.1, 0.1, 0.1]}
                            width={5}
                            height={2}
                            style={styles.balloonText}
                        />
                    </ViroNode>
                )}

                {showBalloons && (
                    <ViroNode position={[-1.3, 0.6, 0]} animation={{ name: 'fadeIn', run: true }}>
                        <ViroBox
                            position={[0, 0, 0]}
                            height={0.38}
                            width={1.1}
                            length={0.02}
                            materials={['balloonBackground']}
                        />
                        <ViroText
                            text="Maagd & Leeuw"
                            position={[0, 0.1, 0.02]}
                            scale={[0.15, 0.15, 0.15]}
                            width={3.5}
                            height={1}
                            style={styles.balloonTitle}
                        />
                        <ViroText
                            text="Zij richt zeis op Frankrijk, temt boeienbreuk Leeuw. Romantisch-realistisch meesterwerk Vlaamse strijd."
                            position={[0, -0.06, 0.02]}
                            scale={[0.1, 0.1, 0.1]}
                            width={5}
                            height={2}
                            style={styles.balloonText}
                        />
                    </ViroNode>
                )}

                {showBalloons && (
                    <ViroNode position={[1.3, 0.6, 0]} animation={{ name: 'fadeIn', run: true }}>
                        <ViroBox
                            position={[0, 0, 0]}
                            height={0.38}
                            width={1.1}
                            length={0.02}
                            materials={['balloonBackground']}
                        />
                        <ViroText
                            text="Drie reliëfs"
                            position={[0, 0.1, 0.02]}
                            scale={[0.15, 0.15, 0.15]}
                            width={3.5}
                            height={1}
                            style={styles.balloonTitle}
                        />
                        <ViroText
                            text="Links: krijger afscheid vrouw/kind onder OLV Groeninge. Midden: Robert d'Artois dood bij paard. Rechts: zegevierende Vlamingen verbroederen."
                            position={[0, -0.06, 0.02]}
                            scale={[0.1, 0.1, 0.1]}
                            width={5}
                            height={2}
                            style={styles.balloonText}
                        />
                    </ViroNode>
                )}

                {showBalloons && (
                    <ViroNode position={[0, 0.2, 1.1]} rotation={[-55, 0, 0]} animation={{ name: 'fadeIn', run: true }}>
                        <ViroQuad
                            position={[0, 0, 0]}
                            width={1.1}
                            height={0.38}
                            materials={['balloonBackground']}
                        />
                        <ViroText
                            text="1302: Guldensporenslag"
                            position={[0, 0.1, 0.01]}
                            scale={[0.15, 0.15, 0.15]}
                            width={3.5}
                            height={1}
                            style={styles.balloonTitle}
                            extrusionDepth={0}
                        />
                        <ViroText
                            text="Vlaams voetvolk verslaat Frans ruiterleger op Groeningekouter. Symbool Vlaamse ontvoogding door Conscience's Leeuw."
                            position={[0, -0.06, 0.01]}
                            scale={[0.1, 0.1, 0.1]}
                            width={5}
                            height={2}
                            style={styles.balloonText}
                            extrusionDepth={0}
                        />
                    </ViroNode>
                )}
            </ViroNode>
        </ViroARScene>
    );
}

export default function ARScene2({ userLocation, sceneKey }: ARScene2Props) {
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);
    const [menuHeight] = useState(new Animated.Value(verticalScale(120)));
    const [artworkData, setArtworkData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showStickerPopup, setShowStickerPopup] = useState(false);
    const [showMovementText, setShowMovementText] = useState(true);
    const { claimSticker } = useClaimedStickers();

    const [fontsLoaded] = useFonts({
        Impact: require('../../assets/fonts/impact.ttf'),
        LeagueSpartan: require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
    });

    // Hide movement text after 2 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowMovementText(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchArtwork = async () => {
            try {
                const response = await fetch(`${STRAPI_URL}/api/artworks?populate=*`);
                const data = await response.json();

                if (data.data && data.data.length > 0) {
                    console.log('ARScene2: Available artworks:', data.data.map((a: any) => a.Name));

                    const targetArtwork = data.data.find(
                        (artwork: any) => {
                            console.log('ARScene2: Checking artwork:', artwork.Name);
                            return artwork.Name === 'Het Groeningemonument' ||
                                artwork.Name === 'Groeningemonument' ||
                                artwork.Name?.includes('Groeninge');
                        }
                    );

                    if (targetArtwork) {
                        console.log('ARScene2: Found artwork:', targetArtwork.Name);
                        setArtworkData(targetArtwork);
                    } else {
                        console.log('ARScene2: Artwork not found, using fallback');
                        setArtworkData(data.data[0]);
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('ARScene2: Error fetching artwork:', error);
                setLoading(false);
            }
        };

        fetchArtwork();
    }, []);

    const toggleMenu = () => {
        const toValue = isMenuExpanded ? verticalScale(120) : verticalScale(380);

        Animated.spring(menuHeight, {
            toValue,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
        }).start();

        setIsMenuExpanded(!isMenuExpanded);
    };

    const handleAnimationFinish = () => {
        setShowStickerPopup(true);
    };

    React.useEffect(() => {
        ViroMaterials.createMaterials({
            balloonBackground: {
                diffuseColor: '#FF7700',
                lightingModel: 'Constant',
            },
        });

        ViroAnimations.registerAnimations({
            fadeIn: {
                properties: { opacity: 1 },
                duration: 1000,
                easing: 'EaseInOut',
            },
        });
    }, []);

    const ARSceneWrapper = () => {
        return (
            <ARScene2Scene
                onAnimationFinish={handleAnimationFinish}
            />
        );
    };

    const artwork = artworkData || {};
    const stickersUrl = artwork.Stickers?.url;
    const fullStickersUrl = stickersUrl || null;

    const calculatedDistance = userLocation && artwork.Location?.lat && artwork.Location?.lng
        ? (calculateDistance(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            artwork.Location.lat,
            artwork.Location.lng
        ) / 1000).toFixed(1)
        : 'N/A';

    return (
        <View style={{ flex: 1 }}>
            <ViroARSceneNavigator
                key={sceneKey}
                autofocus={true}
                initialScene={{ scene: ARSceneWrapper }}
                worldAlignment="Gravity"
                style={{ flex: 1 }}
            />

            {showMovementText && (
                <View style={styles.movementTextOverlay}>
                    <Text style={[styles.movementText, { fontFamily: 'Impact' }]}>
                        Je bent vrij om te bewegen
                    </Text>
                </View>
            )}

            <Modal
                visible={showStickerPopup}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowStickerPopup(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalTitle, { fontFamily: 'Impact' }]}>
                            Sticker gescoord!
                        </Text>
                        <Text style={[styles.modalSubtitle, { fontFamily: 'LeagueSpartan-regular' }]}>
                            Weer een stapje dichter{'\n'}bij de volledige set.
                        </Text>

                        {fullStickersUrl && (
                            <View style={styles.stickerContainer}>
                                <Image
                                    source={{ uri: fullStickersUrl }}
                                    style={styles.popupStickerImage}
                                    resizeMode="contain"
                                />
                            </View>
                        )}

                        <Text style={[styles.stickerTitle, { fontFamily: 'Impact' }]}>
                            {artwork.Name || 'Untitled'}
                        </Text>
                        <Text style={[styles.stickerCreator, { fontFamily: 'LeagueSpartan-regular' }]}>
                            {artwork.Creator || 'Unknown'}
                        </Text>

                        <TouchableOpacity
                            style={styles.claimButton}
                            onPress={() => {
                                if (artworkData?.id) {
                                    claimSticker(artworkData.id);
                                    if (SHOW_DEBUG) {
                                        console.log('Sticker claimed - ID:', artworkData.id);
                                    }
                                }
                                setShowStickerPopup(false);
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.claimButtonText, { fontFamily: 'LeagueSpartan-semibold' }]}>
                                Claim sticker
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {artworkData && fontsLoaded && (
                <Animated.View style={[styles.bottomMenu, { height: menuHeight, backgroundColor: '#000' }]}>
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={toggleMenu}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={require('../../assets/icons/arrow.png')}
                            style={[
                                styles.toggleIcon,
                                { transform: [{ rotate: isMenuExpanded ? '0deg' : '180deg' }] }
                            ]}
                        />
                    </TouchableOpacity>

                    <View style={styles.collapsedContent}>
                        {fullStickersUrl && (
                            <Image
                                source={{ uri: fullStickersUrl }}
                                style={styles.stickerImage}
                            />
                        )}

                        <View style={styles.textContent}>
                            <Text style={[styles.artworkName, { fontFamily: 'Impact' }]}>
                                {artwork.Name || 'Untitled'}
                            </Text>
                            <Text style={[styles.creatorName, { fontFamily: 'LeagueSpartan-regular' }]}>
                                {artwork.Creator || 'Unknown'}
                            </Text>
                        </View>
                    </View>

                    {isMenuExpanded && (
                        <ScrollView
                            style={styles.expandedContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.infoButtonsRow}>
                                <TouchableOpacity style={styles.buttonContainer}>
                                    <Text style={[styles.buttonIcon, { fontFamily: 'Impact' }]}>Jaar</Text>
                                    <View style={styles.button}>
                                        <Text style={[styles.buttonText, { fontFamily: 'LeagueSpartan-regular' }]}>
                                            {artwork.Year || 'N/A'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.buttonContainer}>
                                    <Text style={[styles.buttonIcon, { fontFamily: 'Impact' }]}>Locatie</Text>
                                    <View style={styles.button}>
                                        <Text style={[styles.buttonText, { fontFamily: 'LeagueSpartan-regular' }]}>
                                            {calculatedDistance} km
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.buttonContainer}>
                                    <Text style={[styles.buttonIcon, { fontFamily: 'Impact' }]}>Thema</Text>
                                    <View style={styles.button}>
                                        <Text style={[styles.buttonText, { fontFamily: 'LeagueSpartan-regular' }]}>
                                            {artwork.Theme || 'N/A'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {artwork.Description && (
                                <View style={styles.descriptionContainer}>
                                    <Text style={[styles.description, { fontFamily: 'LeagueSpartan-regular' }]}>
                                        {artwork.Description}
                                    </Text>
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
    movementTextOverlay: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingVertical: verticalScale(20),
        paddingHorizontal: scale(40),
        marginHorizontal: scale(40),
        borderRadius: moderateScale(15),
        transform: [{ translateY: -verticalScale(50) }],
    },
    movementText: {
        fontSize: moderateScale(24),
        color: '#fff',
        textAlign: 'center',
    },
    balloonTitle: {
        fontFamily: 'Impact',
        fontSize: 30,
        color: '#ffffff',
        textAlignVertical: 'center',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    balloonText: {
        fontFamily: 'LeagueSpartan',
        fontSize: 30,
        color: '#ffffff',
        textAlignVertical: 'center',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    bottomMenu: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: moderateScale(30),
        borderTopRightRadius: moderateScale(30),
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(20),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    toggleButton: {
        position: 'absolute',
        top: verticalScale(-25),
        left: '55%',
        transform: [{ translateX: -moderateScale(25) }],
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(25),
        backgroundColor: '#FF7700',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 100,
    },
    toggleIcon: {
        width: moderateScale(20),
        height: moderateScale(20),
        resizeMode: 'contain',
        tintColor: '#fff',
    },
    collapsedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: verticalScale(10),
    },
    stickerImage: {
        width: moderateScale(70),
        height: moderateScale(70),
        resizeMode: 'contain',
        marginRight: scale(15),
    },
    textContent: {
        flex: 1,
        justifyContent: 'center',
    },
    artworkName: {
        fontSize: moderateScale(22),
        color: '#fff',
        marginBottom: verticalScale(5),
    },
    creatorName: {
        fontSize: moderateScale(16),
        color: '#fff',
        opacity: 0.9,
    },
    expandedContent: {
        marginTop: verticalScale(20),
    },
    infoButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(20),
        marginBottom: verticalScale(20),
    },
    buttonContainer: {
        alignItems: 'center',
        position: 'relative',
        flex: 1,
        maxWidth: scale(100),
        marginHorizontal: scale(0),
    },
    buttonIcon: {
        width: moderateScale(100),
        height: moderateScale(100),
        position: 'absolute',
        top: verticalScale(-5),
        zIndex: 10,
        color: '#fff',
        fontSize: moderateScale(20),
        textAlign: 'center',
    },
    button: {
        width: '100%',
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(14),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(8),
        backgroundColor: '#292929',
        paddingTop: verticalScale(20),
        minHeight: verticalScale(70),
    },
    buttonText: {
        color: '#fff',
        fontSize: moderateScale(15),
        textAlign: 'center',
    },
    descriptionContainer: {
        marginBottom: verticalScale(30),
        marginTop: verticalScale(10),
    },
    description: {
        fontSize: moderateScale(15),
        color: '#fff',
        lineHeight: moderateScale(22),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#000',
        borderRadius: moderateScale(20),
        padding: scale(30),
        alignItems: 'center',
        width: scale(320),
    },
    modalTitle: {
        fontSize: moderateScale(32),
        color: '#fff',
        textAlign: 'center',
        marginBottom: verticalScale(10),
    },
    modalSubtitle: {
        fontSize: moderateScale(16),
        color: '#fff',
        textAlign: 'center',
        marginBottom: verticalScale(30),
        lineHeight: moderateScale(22),
    },
    stickerContainer: {
        width: scale(200),
        height: scale(200),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    popupStickerImage: {
        width: '100%',
        height: '100%',
    },
    stickerTitle: {
        fontSize: moderateScale(24),
        color: '#fff',
        textAlign: 'center',
        marginBottom: verticalScale(5),
    },
    stickerCreator: {
        fontSize: moderateScale(16),
        color: '#fff',
        textAlign: 'center',
        marginBottom: verticalScale(30),
        opacity: 0.8,
    },
    claimButton: {
        backgroundColor: '#FF7700',
        paddingVertical: verticalScale(15),
        paddingHorizontal: scale(60),
        borderRadius: moderateScale(30),
        width: '100%',
    },
    claimButtonText: {
        fontSize: moderateScale(18),
        color: '#fff',
        textAlign: 'center',
    },
});