import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants/theme';

const MENU_ITEMS = [
  { icon: 'home', label: 'Home', route: '/(tabs)/' },
  { icon: 'explore', label: 'Explore', route: '/(tabs)/explore' },
  { icon: 'psychology', label: 'AI Chat', route: '/(tabs)/ai' },
  { icon: 'person', label: 'Profile', route: '/(tabs)/profile' },
];

export default function Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="menu" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.logo}>DIGEST</Text>
        {/* Spacer to balance the layout */}
        <View style={{ width: 24 }} />
      </View>

      {/* Side Menu Overlay */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
          <View style={[styles.drawer, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.drawerLogo}>DIGEST</Text>
            <Text style={styles.drawerTagline}>News for the next generation</Text>

            <View style={styles.divider} />

            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.drawerItem}
                activeOpacity={0.7}
                onPress={() => {
                  setMenuOpen(false);
                  router.push(item.route as any);
                }}
              >
                <MaterialIcons
                  name={item.icon as any}
                  size={22}
                  color={Colors.primary}
                />
                <Text style={styles.drawerLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.drawerItem}
              activeOpacity={0.7}
              onPress={() => setMenuOpen(false)}
            >
              <MaterialIcons name="settings" size={22} color={Colors.onSurfaceVariant} />
              <Text style={[styles.drawerLabel, { color: Colors.onSurfaceVariant }]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 10,
    backgroundColor: 'rgba(14,14,15,0.75)',
  },
  logo: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 22,
    letterSpacing: 5,
    color: Colors.onSurface,
  },
  // Drawer styles
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 260,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 24,
  },
  drawerLogo: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 24,
    letterSpacing: 5,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  drawerTagline: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
    opacity: 0.2,
    marginVertical: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
  },
  drawerLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: Colors.onSurface,
  },
});
