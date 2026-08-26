import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../../contexts/AppContext';

export default function ContactsScreen() {
  const { contacts, loadContacts, user } = useContext(AppContext);

  useEffect(() => {
    loadContacts();
  }, []);

  if (!user) return null;

  const isEmergencyContact = user.role === 'EMERGENCY_CONTACT';
  const isElderly = user.role === 'ELDERLY_PERSON';
  const elderlyPerson = (user as any)?.elderlyPersons?.[0];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>NETWORK</Text>

        <Text style={styles.title}>
          {isEmergencyContact ? 'Your Elderly Person' : 'Emergency Contacts'}
        </Text>

        <Text style={styles.subtitle}>
          {isEmergencyContact
            ? 'Person connected to your monitoring account'
            : 'People who will receive your fall alerts'}
        </Text>
      </View>

      {isEmergencyContact && elderlyPerson ? (
        <View style={styles.elderlyCard}>
          <View style={styles.personHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={26} color="#4ED7E6" />
            </View>

            <View style={styles.personInfo}>
              <Text style={styles.contactName}>{elderlyPerson.name}</Text>
              <Text style={styles.relationship}>Monitored person</Text>
            </View>

            <View style={styles.connectedBadge}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>Linked</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {elderlyPerson.phoneNumber && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="call-outline" size={18} color="#4ED7E6" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>
                  {elderlyPerson.phoneNumber}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="mail-outline" size={18} color="#4ED7E6" />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{elderlyPerson.email}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {isElderly && contacts.length > 0 ? (
        contacts.map((c, i) => (
          <View key={i} style={styles.contactCard}>
            <View style={styles.personHeader}>
              <View style={styles.avatar}>
                <Ionicons name="person-outline" size={25} color="#4ED7E6" />
              </View>

              <View style={styles.personInfo}>
                <Text style={styles.contactName}>
                  {c.name ?? `Contact ${i + 1}`}
                </Text>
                <Text style={styles.relationship}>Emergency contact</Text>
              </View>

              <View style={styles.connectedBadge}>
                <View style={styles.connectedDot} />
                <Text style={styles.connectedText}>Active</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {c.phoneNumber && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="call-outline" size={18} color="#4ED7E6" />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{c.phoneNumber}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="mail-outline" size={18} color="#4ED7E6" />
              </View>

              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{c.email}</Text>
              </View>
            </View>
          </View>
        ))
      ) : isElderly ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="people-outline" size={34} color="#4ED7E6" />
          </View>

          <Text style={styles.emptyTitle}>No contacts yet</Text>
          <Text style={styles.empty}>
            Your emergency contacts will appear here.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07172E',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  eyebrow: {
    color: '#4ED7E6',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    color: '#899DB5',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
  },
  contactCard: {
    width: '100%',
    backgroundColor: '#10233E',
    padding: 17,
    marginBottom: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1D3858',
  },
  elderlyCard: {
    width: '100%',
    backgroundColor: '#10233E',
    padding: 17,
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#24506A',
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#163650',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personInfo: {
    flex: 1,
    marginLeft: 13,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  relationship: {
    color: '#8195AE',
    fontSize: 12,
    marginTop: 4,
  },
  connectedBadge: {
    backgroundColor: '#15382F',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#5AE2A8',
    marginRight: 6,
  },
  connectedText: {
    color: '#7FE7BC',
    fontWeight: '700',
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: '#1D3958',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#153550',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    color: '#7489A3',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  detailValue: {
    color: '#F2F6FA',
    fontSize: 14,
    marginTop: 3,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#102D44',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 17,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  empty: {
    marginTop: 6,
    fontSize: 14,
    color: '#8194AC',
    textAlign: 'center',
  },
});





