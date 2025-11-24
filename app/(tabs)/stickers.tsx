import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const STRAPI_URL = 'http://192.168.0.12:1337';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import Bell from '../../assets/icons/doorbell.png';
import Icon11 from '../../assets/prestaties/11.png';
import Icon4 from '../../assets/prestaties/4.png';
import Icon7 from '../../assets/prestaties/7.png';
import Icon120 from '../../assets/prestaties/120.png';
import Icon55 from '../../assets/prestaties/55.png';
import Route from '../../assets/icons/themaRouteIcon.png';
import deJeugd from '../../assets/stickers/deJeugd.png';
import ballerina from '../../assets/stickers/ballerina.png';
import cowboyHenk from '../../assets/stickers/cowboyHenk.png';
import bazuin from '../../assets/stickers/bazuin.png';

export default function SettingsScreen() {
  const [fontsLoaded] = useFonts({
    Impact: require('../../assets/fonts/impact.ttf'),
    LeagueSpartan: require('../../assets/fonts/LeagueSpartan-VariableFont_wght.ttf'),
  });

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("Alle");
  const [artworks, setArtworks] = useState<any[]>([]);
  const [themes, setThemes] = useState<string[]>(['Alle', 'Religie', 'Abstract', 'Fun', 'Gemeenschap', 'Oorlog']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Component mounted, fetching artworks...');
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/artworks?populate=*`);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.error) {
        console.error('Strapi API Error:', data.error);
        alert(`API Error: ${data.error.message}. Please enable public access to artworks in Strapi Settings > Users & Permissions > Public > Artwork`);
        setLoading(false);
        return;
      }
      
      if (data.data) {
        console.log('First artwork:', JSON.stringify(data.data[0], null, 2));
        setArtworks(data.data);
        console.log('Artworks set:', data.data.length);
        
        // Extract unique themes - Strapi v4 uses attributes
        const uniqueThemes = ['Alle', ...new Set(
          data.data
            .map((artwork: any) => {
              const theme = artwork.attributes?.Theme || artwork.Theme;
              console.log('Theme found:', theme);
              return theme;
            })
            .filter((theme: string) => theme)
        )];
        setThemes(uniqueThemes as string[]);
        console.log('Themes set:', uniqueThemes);
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
      alert(`Network Error: ${error}. Make sure Strapi is running on ${STRAPI_URL}`);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    setDropdownVisible(false);
  };

  const currentStickers = selectedTheme === 'Alle'
    ? artworks
    : artworks.filter(artwork => {
        const theme = artwork.attributes?.Theme || artwork.Theme;
        console.log('Filtering - Artwork:', JSON.stringify(artwork, null, 2));
        console.log('Filtering - Theme value:', `"${theme}"`, 'Type:', typeof theme);
        console.log('Filtering - Selected:', `"${selectedTheme}"`, 'Type:', typeof selectedTheme);
        console.log('Filtering - Match:', theme === selectedTheme);
        return theme === selectedTheme;
      });

  console.log('Total artworks:', artworks.length);
  console.log('Current stickers count:', currentStickers.length, 'Selected theme:', selectedTheme);

  if (!fontsLoaded || loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <ThemedView style={styles.titleContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      <TouchableOpacity style={styles.bellButton}>
        <Image source={Bell} style={styles.bellIcon} />
      </TouchableOpacity>

      <ThemedText type="title" style={[styles.mainTitle, { fontFamily: 'Impact' }]}>
        ArtQuestia
      </ThemedText>

      <ThemedText type="title" style={[styles.subtitle, { fontFamily: 'LeagueSpartan' }]}>
        Beleef, ontdek, verbind
      </ThemedText>

      <ThemedText type="title" style={[styles.title, { fontFamily: 'LeagueSpartan' }]}>
        Prestaties
      </ThemedText>

      <View style={styles.rowButtons}>
        <TouchableOpacity style={styles.buttonContainer}>
          <Image source={Icon11} style={styles.buttonIcon} />
          <View style={styles.button}>
            <ThemedText style={styles.buttonText}>Religie</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonContainer}>
          <Image source={Icon4} style={styles.buttonIcon} />
          <View style={styles.button}>
            <ThemedText style={styles.buttonText}>Abstract</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonContainer}>
          <Image source={Icon7} style={styles.buttonIcon} />
          <View style={styles.button}>
            <ThemedText style={styles.buttonText}>Fun</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonContainer}>
          <Image source={Icon120} style={styles.buttonIcon} />
          <View style={styles.button}>
            <ThemedText style={styles.buttonText}>Gemeenschap</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonContainer}>
          <Image source={Icon55} style={styles.buttonIcon} />
          <View style={styles.button}>
            <ThemedText style={styles.buttonText}>Oorlog</ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.themaRoute}>
        <ThemedText type="title" style={[styles.title, { fontFamily: 'LeagueSpartan' }]}>
          Oorlog thema route
        </ThemedText>
        <ThemedText type="title" style={[styles.title, { fontFamily: 'LeagueSpartan' }]}>
          55%
        </ThemedText>
      </View>
      <Image source={Route} style={styles.themaRouteIcon} />


      <ThemedText type="title" style={[styles.title, { fontFamily: 'LeagueSpartan' }]}>
        Stickers
      </ThemedText>
      <View style={styles.buttonContainerStickers}>
        <TouchableOpacity 
          style={styles.buttonStickers1}
          onPress={() => handleThemeSelect('Alle')}
        >
          <ThemedText style={styles.buttonTextStickers}>Alle</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.buttonStickers2}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <ThemedText style={styles.buttonTextStickers}>{selectedTheme === 'Alle' ? "Thema's" : selectedTheme}</ThemedText>
          <ThemedText style={styles.dropdownArrow}>▼</ThemedText>
        </TouchableOpacity>
      </View>

      {dropdownVisible && (
        <View style={styles.dropdownContainer}>
          <ThemedText style={{ color: '#fff', padding: 10 }}>Themes: {themes.length}</ThemedText>
          {themes.filter(theme => theme !== 'Alle').map((theme, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                console.log('Selected theme:', theme);
                handleThemeSelect(theme);
              }}
            >
              <ThemedText style={styles.dropdownText}>{theme}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.rowStickers}>
        {currentStickers.length === 0 ? (
          <ThemedText style={{ color: '#fff', padding: 20 }}>
            No stickers found for theme: {selectedTheme}
          </ThemedText>
        ) : (
          currentStickers.map((artwork, index) => {
            const attributes = artwork.attributes || artwork;
            const stickerData = attributes.Stickers_Hidden?.data;
            const stickerUrl = stickerData?.attributes?.url || stickerData?.url || attributes.Stickers_Hidden?.url;
            const fullUrl = stickerUrl ? `${STRAPI_URL}${stickerUrl}` : null;
            
            console.log('Rendering sticker:', attributes.Name, 'URL:', fullUrl);
            
            return (
              <TouchableOpacity key={artwork.id || index} style={styles.buttonContainer}>
                {fullUrl ? (
                  <Image 
                    source={{ uri: fullUrl }} 
                    style={styles.stickerIcon} 
                  />
                ) : (
                  <View style={[styles.stickerIcon, { backgroundColor: '#444' }]} />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingTop: 70,
    paddingLeft: 20,
    paddingRight: 20,
  },

  bellButton: {
    position: 'absolute',
    top: 60,
    right: 25,
    width: 45,
    height: 45,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  bellIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  mainTitle: {
    fontSize: 32,
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    color: '#fff',
  },
  title: {
    fontSize: 20,
    marginTop: 20,
    color: '#fff',
  },

  container: {
    flexDirection: 'row',
    width: '100%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 16,
  },
  input: {
    flex: 1,
    paddingLeft: 15,
    fontSize: 15,
    color: '#000',
  },
  searchButton: {
    width: 50,
    backgroundColor: '#FF7700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },

  rowButtons: {
    flexDirection: 'row',
    marginTop: 40,
    marginBottom: 20,
    width: '100%',
  },
  buttonContainer: {
    alignItems: 'center',
    position: 'relative',
    width: 85,
  },
  buttonIcon: {
    width: 60,
    height: 77,
    position: 'absolute',
    top: -25,
    zIndex: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'LeagueSpartan',
  },
  themaRoute: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themaRouteIcon: {
    width: '100%',
    height: 60,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  buttonContainerStickers: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  buttonStickers1: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#215AFF',
  },
  buttonStickers2: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF7700',
    gap: 5,
  },
  dropdownArrow: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Impact',
  },
  dropdownContainer: {
    backgroundColor: '#292929',
    borderRadius: 14,
    marginTop: 5,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'LeagueSpartan',
  },
  buttonTextStickers: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Impact',
  },
  rowStickers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 120,
    marginTop: 70,
    marginBottom: 100,
    width: '100%',
  },
  stickerIcon: {
    width: 93,
    height: 90,
    position: 'absolute',
    top: -30,
    zIndex: 10,
  },
});