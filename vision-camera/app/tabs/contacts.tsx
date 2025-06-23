// app/tabs/contacts.tsx
import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppContext } from '../../contexts/AppContext';

export default function ContactsScreen() {
  const { contacts, loadContacts } = useContext(AppContext);

  useEffect(() => {
    loadContacts(); // Llama al backend y actualiza la lista
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>

      {contacts.length > 0 ? (
        contacts.map((c, i) => (
          <View key={i} style={styles.contactItem}>
            <Text style={styles.contactText}>👥 {c.name ?? `Contact ${i + 1}`}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No contacts added.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  contactItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  contactText: { fontSize: 16 },
  empty: { marginTop: 8, fontStyle: 'italic', textAlign: 'center' },
});

