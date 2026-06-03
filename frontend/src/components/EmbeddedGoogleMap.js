import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Lightweight map embed — no native Google Maps SDK, no ARCore requirement.
 * Works on any Android device with a browser engine (any Wi‑Fi / 4G).
 */
const EmbeddedGoogleMap = ({ latitude, longitude, height = 250, style }) => {
  const lat = parseFloat(latitude) || 40.7527;
  const lng = parseFloat(longitude) || -73.9772;
  
  // OpenStreetMap embed URL with dynamic zoom bbox and marker
  const delta = 0.005; // ~500m zoom box around coordinates
  const uri = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;

  if (Platform.OS === 'web') {
    return (
      <iframe
        key={`${lat}-${lng}`}
        title="Map"
        src={uri}
        style={{
          width: '100%',
          height,
          border: 'none',
          borderRadius: 16,
          ...(style || {})
        }}
      />
    );
  }

  return (
    <View style={[{ height, width: '100%', overflow: 'hidden', borderRadius: 16 }, style]}>
      <WebView
        key={`${lat}-${lng}`}
        source={{ uri }}
        style={StyleSheet.absoluteFillObject}
        scrollEnabled={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

export default EmbeddedGoogleMap;
