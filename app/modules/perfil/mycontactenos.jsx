import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MyContactenos = () => {
  const phoneNumber = '+1234567890'; // Cambia este número por el tuyo
  const whatsappNumber = '1234567890'; // Número sin el símbolo +

  const handleCallPress = () => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.openURL(phoneUrl).catch(err => 
      console.error('Error al abrir el marcador:', err)
    );
  };

  const handleWhatsAppPress = () => {
    const message = 'Hola, me gustaría obtener más información';
    const whatsappUrl = Platform.select({
      ios: `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`,
      android: `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`,
      default: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    });

    Linking.canOpenURL(whatsappUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          // Si WhatsApp no está instalado, abre en el navegador
          const webUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch(err => console.error('Error al abrir WhatsApp:', err));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles-outline" size={48} color="#25D366" />
        <Text style={styles.title}>Contáctenos</Text>
        <Text style={styles.subtitle}>Estamos aquí para ayudarte</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.phoneSection}>
          <Ionicons name="call-outline" size={24} color="#007AFF" />
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>
        </View>

        <TouchableOpacity 
          style={styles.callButton}
          onPress={handleCallPress}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.buttonText}>Llamar ahora</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.whatsappButton}
          onPress={handleWhatsAppPress}
          activeOpacity={0.7}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={styles.buttonText}>Enviar WhatsApp</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Horario de atención: Lunes a Viernes 9:00 AM - 6:00 PM
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  phoneSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  phoneNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 15,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default MyContactenos;
