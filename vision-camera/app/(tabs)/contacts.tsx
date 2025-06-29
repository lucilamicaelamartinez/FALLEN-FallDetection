import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AppContext } from '../../contexts/AppContext';

export default function ContactsScreen() {
  const { contacts, loadContacts, user } = useContext(AppContext);

  useEffect(() => {
    loadContacts(); // Actualiza lista al montar
  }, []);

  if (!user) return null;

  const isEmergencyContact = user.role === 'EMERGENCY_CONTACT';
  const isElderly = user.role === 'ELDERLY_PERSON';
  const elderlyPerson = (user as any)?.elderlyPersons?.[0]; // solo para contactos

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {isEmergencyContact ? 'Your Elderly Person' : 'Your Emergency Contacts'}
      </Text>

      {/* Si es contacto de emergencia */}
      {isEmergencyContact && elderlyPerson ? (
        <View style={styles.elderlyCard}>
          <Text style={styles.contactName}>🧓 {elderlyPerson.name}</Text>
          {elderlyPerson.phoneNumber && (
            <Text style={styles.phone}>📞 {elderlyPerson.phoneNumber}</Text>
          )}
          <Text style={styles.email}>✉️ {elderlyPerson.email}</Text>
        </View>
      ) : null}

      {/* Si es persona mayor */}
      {isElderly && contacts.length > 0 ? (
        contacts.map((c, i) => (
          <View key={i} style={styles.contactCard}>
            <Text style={styles.contactName}>👥 {c.name ?? `Contact ${i + 1}`}</Text>
            {c.phoneNumber && <Text style={styles.phone}>📞 {c.phoneNumber}</Text>}
            <Text style={styles.email}>✉️ {c.email}</Text>
          </View>
        ))
      ) : isElderly ? (
        <Text style={styles.empty}>No contacts added.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#061833',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  contactCard: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  elderlyCard: {
    width: '100%',
    backgroundColor: '#e6f7ff',
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    borderColor: '#3399ff',
    borderWidth: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  phone: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#777',
  },
  empty: {
    fontStyle: 'italic',
    marginTop: 16,
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
});





