import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const menuSections = [
    {
      title: 'Μαγαζί',
      items: [
        {
          id: '1',
          icon: 'storefront-outline',
          name: 'Πληροφορίες Μαγαζιού',
          color: '#FF6B35',
        },
        {
          id: '2',
          icon: 'time-outline',
          name: 'Ώρες Λειτουργίας',
          color: '#3B82F6',
        },
        {
          id: '3',
          icon: 'location-outline',
          name: 'Διεύθυνση',
          color: '#10B981',
        },
      ],
    },
    {
      title: 'Λογαριασμός',
      items: [
        {
          id: '4',
          icon: 'person-outline',
          name: 'Προφίλ',
          color: '#8B5CF6',
        },
        {
          id: '5',
          icon: 'card-outline',
          name: 'Πληρωμές & Χρεώσεις',
          color: '#EF4444',
        },
        {
          id: '6',
          icon: 'stats-chart-outline',
          name: 'Αναλυτικά',
          color: '#F59E0B',
          screen: 'Analytics',
        },
        {
          id: '11',
          icon: 'pricetag-outline',
          name: 'Προσφορές',
          color: '#10B981',
          screen: 'Promotions',
        },
      ],
    },
    {
      title: 'Ρυθμίσεις',
      items: [
        {
          id: '7',
          icon: 'notifications-outline',
          name: 'Ειδοποιήσεις',
          color: '#6B7280',
          screen: 'Notifications',
        },
        {
          id: '12',
          icon: 'settings-outline',
          name: 'Ρυθμίσεις Μαγαζιού',
          color: '#3B82F6',
          screen: 'Settings',
        },
        {
          id: '8',
          icon: 'help-circle-outline',
          name: 'Βοήθεια',
          color: '#6B7280',
        },
        {
          id: '9',
          icon: 'document-text-outline',
          name: 'Όροι Χρήσης',
          color: '#6B7280',
        },
        {
          id: '10',
          icon: 'log-out-outline',
          name: 'Αποσύνδεση',
          color: '#EF4444',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#FF6B35', '#FF8C5A']}
          style={styles.header}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Ionicons name="storefront" size={32} color="#FF6B35" />
            </View>
            <Text style={styles.restaurantName}>Το Μαγαζί σας</Text>
            <Text style={styles.restaurantEmail}>merchant@nofee.gr</Text>
          </View>
        </LinearGradient>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => {
                  if ((item as any).screen) {
                    navigation.navigate((item as any).screen as never);
                  } else {
                    console.log('Pressed:', item.name);
                  }
                }}
              >
                <View
                  style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}
                >
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={styles.menuItemText}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Έκδοση 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 30,
    paddingTop: 40,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  restaurantEmail: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 30,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

