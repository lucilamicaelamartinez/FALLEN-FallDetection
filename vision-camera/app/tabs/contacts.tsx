// app/tabs/contacts.tsx
import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AppContext } from '../../contexts/AppContext';

export default function ContactsScreen() {
  const { contacts, loadContacts } = useContext(AppContext);

  useEffect(() => {
    loadContacts(); // Llama al backend y actualiza la lista
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>

      {contacts.length > 0 ? (
        contacts.map((c, i) => (
          <View key={i} style={styles.contactCard}>
            <Text style={styles.contactName}>👥 {c.name ?? `Contact ${i + 1}`}</Text>
            {typeof c.phoneNumber === 'string' && c.phoneNumber.trim() !== '' && (
              <Text style={styles.phone}>📞 {c.phoneNumber}</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No contacts added.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#061833', // ← igual al de la HomeScreen
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff', // ← blanco para mejor contraste
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
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  phone: {
    fontSize: 16,
    color: '#555',
  },
  empty: {
    fontStyle: 'italic',
    marginTop: 16,
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
});




