import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

interface MapModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (address: string, coordinates: { latitude: number; longitude: number }) => void;
}

export default function MapModal({ visible, onClose, onConfirm }: MapModalProps) {
  const [region, setRegion] = useState<Region>({
    latitude: 37.9838,
    longitude: 23.7275,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [centerPosition, setCenterPosition] = useState({
    latitude: 37.9838,
    longitude: 23.7275,
  });
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{
    display_name: string;
    lat: string;
    lon: string;
    name?: string;
    type?: string;
    class?: string;
    address?: any;
    importance?: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mapRef = useRef<MapView>(null);
  const reverseGeocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastGeocodedPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const isRegionChangingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (reverseGeocodeTimeoutRef.current) {
        clearTimeout(reverseGeocodeTimeoutRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [visible]);

  // Real-time search suggestions as user types
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search by 600ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const currentLat = region.latitude;
        const currentLon = region.longitude;
        const viewbox = `${currentLon - 0.1},${currentLat - 0.1},${currentLon + 0.1},${currentLat + 0.1}`;
        
        // Simple, reliable search with Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=8&addressdetails=1&countrycodes=gr&viewbox=${viewbox}&bounded=0`,
          {
            headers: {
              'User-Agent': 'NofeeApp/1.0',
            },
          }
        );

        if (!response.ok) {
          setSearchSuggestions([]);
          setShowSuggestions(false);
          return;
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          setSearchSuggestions([]);
          setShowSuggestions(false);
          return;
        }

        // Check if query has number
        const queryHasNumber = /\d+/.test(searchQuery);
        const queryNumbers = queryHasNumber ? searchQuery.match(/\d+/g) || [] : [];
        const queryParts = searchQuery.trim().split(/\s+/);
        const streetParts = queryParts.filter(part => !/\d+/.test(part));
        const streetName = streetParts.join(' ');

        // Score and filter results - ONLY show specific addresses with house numbers or roads
        const scoredResults = data
          .map((item) => {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            const latDiff = lat - currentLat;
            const lonDiff = lon - currentLon;
            const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);

            const houseNumber = item.address?.house_number || '';
            const hasHouseNumber = !!houseNumber;
            const hasRoad = !!item.address?.road;

            // Number match
            let numberMatch = 0;
            if (queryHasNumber && houseNumber) {
              const hnStr = String(houseNumber).trim();
              queryNumbers.forEach(qn => {
                if (hnStr === qn.trim()) numberMatch = 3;
                else if (hnStr.includes(qn.trim()) || qn.trim().includes(hnStr)) numberMatch = Math.max(numberMatch, 2);
              });
            }

            // Street match
            let streetMatch = 0;
            if (streetName && item.address?.road) {
              const road = item.address.road.toLowerCase();
              const search = streetName.toLowerCase();
              if (road.includes(search) || search.includes(road)) streetMatch = 1;
            }

            // Score
            let score = 0;
            if (numberMatch > 0) score = numberMatch + streetMatch;
            else if (hasHouseNumber && hasRoad) score = 1 + streetMatch;
            else if (hasRoad) score = queryHasNumber ? 0.1 : 0.3 + streetMatch;

            score += Math.max(0, 0.1 * (1 - Math.min(distance / 0.1, 1)));

            return { ...item, score, hasHouseNumber, numberMatch, streetMatch };
          })
          .filter((item) => {
            // Filter out landmarks, tourist attractions, natural features
            const isLandmark = item.type === 'tourism' ||
                              item.type === 'historic' ||
                              item.type === 'leisure' ||
                              item.type === 'natural' ||
                              item.type === 'landuse';
            
            // Filter out pure administrative areas (but allow if they have road)
            const isPureAdmin = (item.type === 'administrative' || item.class === 'boundary') && 
                               !item.address?.road;
            
            // MUST have road name OR house number
            const hasRoad = !!item.address?.road;
            const hasHouseNumber = !!item.address?.house_number;
            
            // Allow if has road (or house number) and is not a landmark
            return !isLandmark && !isPureAdmin && (hasRoad || hasHouseNumber);
          });

        // Filter by house number - prefer addresses with numbers
        let filtered = scoredResults;
        if (queryHasNumber) {
          // When query has number, prioritize results with matching house numbers
          const withMatchingNumbers = scoredResults.filter(r => r.numberMatch > 0);
          if (withMatchingNumbers.length > 0) {
            filtered = withMatchingNumbers;
          } else {
            // If no matching numbers, show all results with house numbers
            const withNumbers = scoredResults.filter(r => r.hasHouseNumber);
            if (withNumbers.length > 0) {
              filtered = withNumbers;
            } else {
              // If no house numbers at all, show roads that match street name
              const matchingStreets = scoredResults.filter(r => r.streetMatch > 0);
              filtered = matchingStreets.length > 0 ? matchingStreets : scoredResults;
            }
          }
        } else {
          // Prefer addresses with house numbers, but show all if none found
          const withNumbers = scoredResults.filter(r => r.hasHouseNumber);
          filtered = withNumbers.length > 0 ? withNumbers : scoredResults;
        }

        // Sort and take top 5
        const sorted = filtered
          .sort((a, b) => {
            if (queryHasNumber && a.numberMatch !== b.numberMatch) return b.numberMatch - a.numberMatch;
            if (a.hasHouseNumber !== b.hasHouseNumber) return b.hasHouseNumber ? 1 : -1;
            if (a.streetMatch !== b.streetMatch) return b.streetMatch - a.streetMatch;
            return b.score - a.score;
          })
          .slice(0, 5)
          .map(({ score, hasHouseNumber, numberMatch, streetMatch, ...item }) => item);

        setSearchSuggestions(sorted);
        setShowSuggestions(true);
      } catch (error) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 600);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Δεν δόθηκε άδεια',
          text2: 'Χρειάζεται άδεια για πρόσβαση στη θέση',
          position: 'top',
          visibilityTime: 3000,
        });
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      setCenterPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      reverseGeocode(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      Toast.show({
        type: 'error',
        text1: 'Σφάλμα',
        text2: 'Δεν ήταν δυνατή η εύρεση της θέσης',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    // Clear any pending timeout
    if (reverseGeocodeTimeoutRef.current) {
      clearTimeout(reverseGeocodeTimeoutRef.current);
    }

    // Debounce reverse geocoding to avoid rate limiting (1 second delay)
    reverseGeocodeTimeoutRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        
        // Try expo-location reverse geocoding first (more reliable)
        try {
          const addresses = await Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lng,
          });
          
          if (addresses && addresses.length > 0) {
            const addr = addresses[0];
            const addressParts = [];
            
            // Build address from expo-location format
            if (addr.street && addr.streetNumber) {
              addressParts.push(`${addr.street} ${addr.streetNumber}`);
            } else if (addr.street) {
              addressParts.push(addr.street);
            }
            
            if (addr.district) {
              addressParts.push(addr.district);
            }
            
            if (addr.city || addr.name) {
              addressParts.push(addr.city || addr.name);
            }
            
            if (addr.postalCode) {
              addressParts.push(addr.postalCode);
            }
            
            if (addressParts.length > 0) {
              setAddress(addressParts.join(', '));
              setIsLoading(false);
              return;
            }
          }
        } catch (expoError) {
          // If expo-location fails, try Nominatim API
          console.log('Expo location reverse geocoding failed, trying Nominatim');
        }

        // Fallback to OpenStreetMap Nominatim API
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=el`,
          {
            headers: {
              'User-Agent': 'NofeeApp/1.0',
              'Accept': 'application/json',
            },
          }
        );

        // Check if response is OK
        if (!response.ok) {
          // If rate limited, show coordinates
          setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setIsLoading(false);
          return;
        }

        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // If not JSON, show coordinates
          setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setIsLoading(false);
          return;
        }
        
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          // If JSON parse fails, show coordinates
          setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setIsLoading(false);
          return;
        }

        // Try to get address from different fields
        if (data && data.display_name) {
          // Use display_name if available (most complete)
          setAddress(data.display_name);
        } else if (data && data.address) {
          // Build address from address components if display_name is not available
          const addr = data.address;
          const addressParts = [];
          
          // Build address in order: street + number, area, city, postcode
          if (addr.road) {
            const street = addr.house_number 
              ? `${addr.road} ${addr.house_number}`
              : addr.road;
            addressParts.push(street);
          } else if (addr.house_number) {
            addressParts.push(addr.house_number);
          }
          
          if (addr.suburb || addr.neighbourhood || addr.quarter) {
            addressParts.push(addr.suburb || addr.neighbourhood || addr.quarter);
          }
          
          if (addr.city || addr.town || addr.village || addr.municipality) {
            addressParts.push(addr.city || addr.town || addr.village || addr.municipality);
          }
          
          if (addr.postcode) {
            addressParts.push(addr.postcode);
          }
          
          if (addressParts.length > 0) {
            setAddress(addressParts.join(', '));
          } else {
            // Last resort: show coordinates
            setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
        } else if (data && data.error) {
          // API returned an error
          setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } else {
          // No address data available
          setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      } catch (error) {
        // Silent fail - just show coordinates
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } finally {
        setIsLoading(false);
      }
    }, 1000); // 1 second debounce to reduce API calls
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    isRegionChangingRef.current = false;
    
    // Check if position actually changed significantly (avoid unnecessary geocoding)
    const lastPos = lastGeocodedPositionRef.current;
    const latDiff = lastPos ? Math.abs(newRegion.latitude - lastPos.lat) : 1;
    const lngDiff = lastPos ? Math.abs(newRegion.longitude - lastPos.lng) : 1;
    
    // Only geocode if position changed significantly (more than ~10 meters)
    if (!lastPos || latDiff > 0.0001 || lngDiff > 0.0001) {
      // Update center position (marker stays fixed in center)
      setCenterPosition({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      });
      // Reverse geocode the center of the map
      reverseGeocode(newRegion.latitude, newRegion.longitude);
      lastGeocodedPositionRef.current = {
        lat: newRegion.latitude,
        lng: newRegion.longitude,
      };
    }
  };

  const handleSelectSuggestion = (suggestion: { display_name: string; lat: string; lon: string }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    setSearchSuggestions([]);

    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);

    if (!isNaN(lat) && !isNaN(lon)) {
      const newRegion = {
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      setCenterPosition({
        latitude: lat,
        longitude: lon,
      });

      lastGeocodedPositionRef.current = {
        lat: lat,
        lng: lon,
      };

      setAddress(suggestion.display_name);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Σφάλμα',
        text2: 'Παρακαλώ εισάγετε διεύθυνση',
        position: 'top',
        visibilityTime: 2000,
      });
      return;
    }

    // If there are suggestions and user pressed search, use first suggestion
    if (searchSuggestions.length > 0) {
      handleSelectSuggestion(searchSuggestions[0]);
      return;
    }

    try {
      setIsSearching(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const currentLat = region.latitude;
      const currentLon = region.longitude;
      const viewbox = `${currentLon - 0.1},${currentLat - 0.1},${currentLon + 0.1},${currentLat + 0.1}`;
      
      // Simple, reliable search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1&countrycodes=gr&viewbox=${viewbox}&bounded=0`,
        {
          headers: {
            'User-Agent': 'NofeeApp/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Network error');
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        Toast.show({
          type: 'error',
          text1: 'Δεν βρέθηκε',
          text2: 'Δοκιμάστε μια άλλη αναζήτηση',
          position: 'top',
          visibilityTime: 2000,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      // Prefer addresses with house numbers if query has number
      const queryHasNumber = /\d+/.test(searchQuery);
      let result = data[0];
      
      if (queryHasNumber) {
        const withNumber = data.find(item => item.address?.house_number);
        if (withNumber) result = withNumber;
      }

      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);
      
      if (isNaN(lat) || isNaN(lon)) {
        throw new Error('Invalid coordinates');
      }

      const newRegion = {
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      setCenterPosition({ latitude: lat, longitude: lon });
      lastGeocodedPositionRef.current = { lat, lng: lon };
      
      if (result.display_name) {
        setAddress(result.display_name);
      } else {
        reverseGeocode(lat, lon);
      }
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
      
      setShowSuggestions(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Σφάλμα',
        text2: 'Πρόβλημα κατά την αναζήτηση. Δοκιμάστε ξανά.',
        position: 'top',
        visibilityTime: 3000,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    if (!address.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Σφάλμα',
        text2: 'Παρακαλώ επιλέξτε μια διεύθυνση',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm(address, centerPosition);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Επιλογή Διεύθυνσης</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Αναζήτηση διεύθυνσης..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
              }}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              onFocus={() => {
                if (searchSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding suggestions to allow tap
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            {isSearching && (
              <ActivityIndicator size="small" color="#FF6B35" style={styles.searchLoader} />
            )}
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSearchSuggestions([]);
                  setShowSuggestions(false);
                  setIsSearching(false);
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Suggestions */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView 
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
            >
              {searchSuggestions.map((suggestion, index) => {
                // Format address for delivery - prioritize street + number
                const formatAddress = (item: any) => {
                  if (item.address) {
                    const addr = item.address;
                    
                    // Build street address with number (delivery address)
                    let streetAddress = '';
                    if (addr.road) {
                      streetAddress = addr.house_number 
                        ? `${addr.road} ${addr.house_number}`
                        : addr.road;
                    } else if (addr.house_number) {
                      streetAddress = addr.house_number;
                    }
                    
                    // Location (city, area, postcode)
                    const locationParts = [];
                    if (addr.suburb || addr.neighbourhood) {
                      locationParts.push(addr.suburb || addr.neighbourhood);
                    }
                    if (addr.city || addr.town || addr.municipality) {
                      locationParts.push(addr.city || addr.town || addr.municipality);
                    }
                    if (addr.postcode) {
                      locationParts.push(addr.postcode);
                    }
                    const location = locationParts.join(', ');
                    
                    // If we have a proper street address, use it
                    if (streetAddress) {
                      return { 
                        primary: streetAddress, 
                        secondary: location || (item.name ? item.name : '') 
                      };
                    }
                    
                    // Fallback to name if available
                    if (item.name) {
                      return { primary: item.name, secondary: location };
                    }
                  }
                  
                  // Last resort: use display_name
                  const parts = item.display_name?.split(',') || [];
                  if (parts.length >= 2) {
                    return { 
                      primary: parts[0].trim(), 
                      secondary: parts.slice(1, 3).join(', ').trim() 
                    };
                  }
                  return { primary: item.display_name || '', secondary: '' };
                };
                
                const formatted = formatAddress(suggestion);
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(suggestion)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.suggestionIconContainer}>
                      <Ionicons 
                        name={
                          suggestion.type === 'restaurant' || suggestion.type === 'cafe' ? 'restaurant' :
                          suggestion.type === 'shop' ? 'storefront' :
                          suggestion.class === 'highway' ? 'map' :
                          'location'
                        } 
                        size={22} 
                        color="#FF6B35" 
                      />
                    </View>
                    <View style={styles.suggestionTextContainer}>
                      <Text style={styles.suggestionPrimary} numberOfLines={1}>
                        {formatted.primary}
                      </Text>
                      {formatted.secondary ? (
                        <Text style={styles.suggestionSecondary} numberOfLines={1}>
                          {formatted.secondary}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Map */}
        <View style={styles.mapContainer}>
          {isLoading && !address ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Εύρεση θέσης...</Text>
            </View>
          ) : (
            <>
              <MapView
                ref={mapRef}
                style={styles.map}
                region={region}
                onRegionChangeComplete={handleRegionChangeComplete}
                onRegionChange={() => {
                  // Mark that region is changing to prevent unnecessary updates
                  isRegionChangingRef.current = true;
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                mapType="standard"
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={false}
              />
              {/* Fixed Pin Marker in Center */}
              <View style={styles.fixedMarkerContainer} pointerEvents="none">
                <View style={styles.markerContainer}>
                  <Ionicons name="location" size={48} color="#FF6B35" />
                  <View style={styles.markerPin} />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Address Display */}
        <View style={styles.addressContainer}>
          <View style={styles.addressContent}>
            <Ionicons name="location" size={20} color="#FF6B35" />
            <View style={styles.addressTextContainer}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FF6B35" />
              ) : (
                <Text style={styles.addressText} numberOfLines={2}>
                  {address || 'Επιλέξτε θέση στον χάρτη'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Confirm Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, (!address || isLoading) && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!address || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>Επιβεβαίωση</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  searchLoader: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    maxHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 14,
    backgroundColor: '#FFFFFF',
  },
  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionTextContainer: {
    flex: 1,
    gap: 4,
  },
  suggestionPrimary: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    lineHeight: 22,
  },
  suggestionSecondary: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
    lineHeight: 18,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  fixedMarkerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  markerPin: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginTop: -4,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  addressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

