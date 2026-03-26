import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { lookupBarcode } from '@/lib/openFoodFacts';
import { usePantry } from '@/hooks/usePantry';
import { OpenFoodFactsProduct, PantryCategory } from '@/types';

const CATEGORIES: { key: PantryCategory; label: string; icon: string }[] = [
  { key: 'fridge', label: 'Fridge', icon: '🌡️' },
  { key: 'freezer', label: 'Freezer', icon: '❄️' },
  { key: 'pantry', label: 'Pantry', icon: '🥫' },
];

export default function ScanScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { addItem } = usePantry();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<OpenFoodFactsProduct | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PantryCategory>('pantry');
  const [quantity, setQuantity] = useState(1);
  const [torchOn, setTorchOn] = useState(false);

  async function handleBarcodeScan({ data }: BarcodeScanningResult) {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    setNotFound(false);

    try {
      const result = await lookupBarcode(data);
      if (result) {
        setProduct(result);
        setShowModal(true);
      } else {
        setNotFound(true);
        // Allow rescan after 2s
        setTimeout(() => {
          setScanned(false);
          setNotFound(false);
        }, 2000);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not look up this barcode. Check your internet connection.');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToShopping() {
    if (!product) return;
    addItem({
      name: product.name,
      brand: product.brand,
      barcode: product.barcode,
      category: selectedCategory,
      quantity,
      unit: 'pcs',
      image_url: product.image_url,
    });
    setShowModal(false);
    setProduct(null);
    setScanned(false);
    setQuantity(1);
    Alert.alert('Added!', `${product.name} added to your ${selectedCategory}.`);
  }

  if (!permission) {
    return (
      <View style={[styles.centred, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.tint} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centred, { backgroundColor: theme.background }]}>
        <Ionicons name="camera-outline" size={64} color={theme.textSecondary} />
        <Text style={[styles.permTitle, { color: theme.text }]}>Camera Access Required</Text>
        <Text style={[styles.permSubtitle, { color: theme.textSecondary }]}>
          PantryMate needs your camera to scan product barcodes.
        </Text>
        <TouchableOpacity
          style={[styles.permButton, { backgroundColor: theme.tint }]}
          onPress={requestPermission}
        >
          <Text style={styles.permButtonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchOn}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
      />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.scanTitle}>Scan a Barcode</Text>
          <TouchableOpacity onPress={() => setTorchOn((t) => !t)} style={styles.torchBtn}>
            <Ionicons name={torchOn ? 'flash' : 'flash-outline'} size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Viewfinder */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>

        {/* Bottom hint */}
        <View style={styles.bottomHint}>
          {loading ? (
            <View style={styles.hintRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.hintText}>Looking up product...</Text>
            </View>
          ) : notFound ? (
            <Text style={styles.hintTextWarning}>
              ⚠️ Product not found. Try scanning again.
            </Text>
          ) : (
            <Text style={styles.hintText}>Point your camera at a barcode</Text>
          )}
          {scanned && !loading && !notFound && (
            <TouchableOpacity
              style={styles.rescanBtn}
              onPress={() => setScanned(false)}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.rescanText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Product Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add to Pantry</Text>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                setScanned(false);
                setProduct(null);
              }}
            >
              <Ionicons name="close" size={26} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {product && (
              <>
                {/* Product info */}
                <View style={[styles.productCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
                  {product.brand && (
                    <Text style={[styles.productBrand, { color: theme.textSecondary }]}>{product.brand}</Text>
                  )}
                  <Text style={[styles.productBarcode, { color: theme.textSecondary }]}>
                    🔖 {product.barcode}
                  </Text>
                </View>

                {/* Category picker */}
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  WHERE TO STORE
                </Text>
                <View style={styles.categoryRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryPill,
                        { borderColor: theme.border, backgroundColor: theme.surface },
                        selectedCategory === cat.key && {
                          backgroundColor: theme.tint,
                          borderColor: theme.tint,
                        },
                      ]}
                      onPress={() => setSelectedCategory(cat.key)}
                    >
                      <Text style={styles.categoryPillEmoji}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categoryPillText,
                          { color: theme.text },
                          selectedCategory === cat.key && { color: '#fff' },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Quantity */}
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>QUANTITY</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { borderColor: theme.border }]}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Ionicons name="remove" size={20} color={theme.tint} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: theme.text }]}>{quantity}</Text>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { borderColor: theme.border }]}
                    onPress={() => setQuantity(quantity + 1)}
                  >
                    <Ionicons name="add" size={20} color={theme.tint} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.tint }]}
              onPress={handleAddToShopping}
            >
              <Ionicons name="basket-outline" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add to Pantry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centred: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permTitle: { fontSize: 22, fontWeight: '700', marginTop: 20, marginBottom: 10, textAlign: 'center' },
  permSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  permButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  scanTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  torchBtn: { padding: 8 },
  viewfinderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: 260,
    height: 180,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#2D6A4F',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 3,
  },
  bottomHint: {
    alignItems: 'center',
    paddingBottom: 60,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    gap: 12,
  },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hintText: { color: '#fff', fontSize: 14 },
  hintTextWarning: { color: '#FEF08A', fontSize: 14, fontWeight: '600' },
  rescanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rescanText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  // Modal
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: 56,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalBody: { flex: 1, padding: 20 },
  productCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  productName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  productBrand: { fontSize: 14, marginBottom: 4 },
  productBarcode: { fontSize: 12, marginTop: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  categoryRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  categoryPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  categoryPillEmoji: { fontSize: 18 },
  categoryPillText: { fontSize: 13, fontWeight: '600' },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 24, fontWeight: '700', minWidth: 40, textAlign: 'center' },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
