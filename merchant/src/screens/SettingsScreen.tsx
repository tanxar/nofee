import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { mockStoreSettings } from '../data/mockData';
import Toast from 'react-native-toast-message';

export default function SettingsScreen() {
  const [settings, setSettings] = useState(mockStoreSettings);
  const [editingHours, setEditingHours] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const days = [
    { key: 'monday', label: 'Δευτέρα' },
    { key: 'tuesday', label: 'Τρίτη' },
    { key: 'wednesday', label: 'Τετάρτη' },
    { key: 'thursday', label: 'Πέμπτη' },
    { key: 'friday', label: 'Παρασκευή' },
    { key: 'saturday', label: 'Σάββατο' },
    { key: 'sunday', label: 'Κυριακή' },
  ];

  const handleSave = () => {
    Toast.show({
      type: 'success',
      text1: 'Αποθηκεύτηκε',
      text2: 'Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ρυθμίσεις Μαγαζιού</Text>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Βασικές Πληροφορίες</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Όνομα Μαγαζιού</Text>
            <TextInput
              style={styles.input}
              value={settings.name}
              onChangeText={(text) => setSettings({ ...settings, name: text })}
              placeholder="Όνομα μαγαζιού"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Περιγραφή</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={settings.description}
              onChangeText={(text) => setSettings({ ...settings, description: text })}
              placeholder="Περιγραφή"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Τηλέφωνο</Text>
            <TextInput
              style={styles.input}
              value={settings.phone}
              onChangeText={(text) => setSettings({ ...settings, phone: text })}
              placeholder="Τηλέφωνο"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={settings.email}
              onChangeText={(text) => setSettings({ ...settings, email: text })}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Διεύθυνση</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={settings.address}
              onChangeText={(text) => setSettings({ ...settings, address: text })}
              placeholder="Διεύθυνση"
              multiline
            />
          </View>
        </View>

        {/* Opening Hours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ώρες Λειτουργίας</Text>
            <TouchableOpacity onPress={() => setEditingHours(true)}>
              <Ionicons name="create-outline" size={20} color="#FF6B35" />
            </TouchableOpacity>
          </View>

          {days.map((day) => {
            const hours = settings.openingHours[day.key];
            return (
              <View key={day.key} style={styles.hoursRow}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                {hours.closed ? (
                  <Text style={styles.closedText}>Κλειστό</Text>
                ) : (
                  <Text style={styles.hoursText}>
                    {hours.open} - {hours.close}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Delivery Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ρυθμίσεις Παράδοσης</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ελάχιστη Παραγγελία (€)</Text>
            <TextInput
              style={styles.input}
              value={settings.minOrderAmount.toString()}
              onChangeText={(text) =>
                setSettings({ ...settings, minOrderAmount: parseFloat(text) || 0 })
              }
              placeholder="10.00"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Εκτιμώμενος Χρόνος Παράδοσης (λεπτά)</Text>
            <TextInput
              style={styles.input}
              value={settings.estimatedDeliveryTime.toString()}
              onChangeText={(text) =>
                setSettings({
                  ...settings,
                  estimatedDeliveryTime: parseInt(text) || 0,
                })
              }
              placeholder="30"
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Μέθοδοι Πληρωμής</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Ionicons name="cash-outline" size={20} color="#6B7280" />
              <Text style={styles.switchLabel}>Μετρητά</Text>
            </View>
            <Switch
              value={settings.acceptsCash}
              onValueChange={(value) =>
                setSettings({ ...settings, acceptsCash: value })
              }
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Ionicons name="card-outline" size={20} color="#6B7280" />
              <Text style={styles.switchLabel}>Κάρτα</Text>
            </View>
            <Switch
              value={settings.acceptsCard}
              onValueChange={(value) =>
                setSettings({ ...settings, acceptsCard: value })
              }
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Ionicons name="phone-portrait-outline" size={20} color="#6B7280" />
              <Text style={styles.switchLabel}>Ψηφιακή Πληρωμή</Text>
            </View>
            <Switch
              value={settings.acceptsDigital}
              onValueChange={(value) =>
                setSettings({ ...settings, acceptsDigital: value })
              }
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Delivery Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ζώνες Παράδοσης</Text>
          {settings.deliveryZones.map((zone, index) => (
            <View key={index} style={styles.zoneCard}>
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zoneDetails}>
                  {zone.radius}km • €{zone.deliveryFee.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="create-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={20} color="#FF6B35" />
            <Text style={styles.addButtonText}>Προσθήκη Ζώνης</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Αποθήκευση Ρυθμίσεων</Text>
          </TouchableOpacity>
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
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  section: {
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  hoursText: {
    fontSize: 14,
    color: '#6B7280',
  },
  closedText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  zoneCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  zoneDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  saveContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

