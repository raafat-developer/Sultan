import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  G,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import {
  Navigation,
  Gauge,
  BatteryCharging,
  Compass,
  MapPin,
  Play,
  RotateCcw,
  ExternalLink,
  Layers,
} from 'lucide-react-native';

interface GpsRouteSimulatorProps {
  pickupName?: string;
  deliveryAddress?: string;
  pickupCoords?: { lat: number; lng: number };
  deliveryCoords?: { lat: number; lng: number };
  status?: string;
  orderNumber?: string;
}

export function GpsRouteSimulator({
  pickupName = 'Zaatar W Zeit Bakery',
  deliveryAddress = '14 Abbas El Akkad St, Nasr City',
  pickupCoords = { lat: 30.0734, lng: 31.3468 },
  deliveryCoords = { lat: 30.0571, lng: 31.3418 },
  status = 'GOING_TO_PICKUP',
  orderNumber = 'FM-2026-000123',
}: GpsRouteSimulatorProps) {
  const { t, isRTL } = useSettingsStore();

  // Telemetry simulation state
  const [speed, setSpeed] = useState(42);
  const [battery, setBattery] = useState(94);
  const [progress, setProgress] = useState(0.35); // 0 (pickup) to 1 (delivery)
  const [isSimulating, setIsSimulating] = useState(true);
  const [mapStyle, setMapStyle] = useState<'cyber' | 'radar'>('cyber');

  // Animation loop for realistic motorcycle speed variations
  useEffect(() => {
    const speedInterval = setInterval(() => {
      // Natural speed fluctuations between 36 and 54 km/h
      const fluctuation = Math.floor(Math.random() * 9) - 4;
      setSpeed((prev) => Math.max(28, Math.min(58, prev + fluctuation)));
    }, 1500);

    return () => clearInterval(speedInterval);
  }, []);

  // Motion simulation along path
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 0.98) return 0.05; // loop route smoothly
          return prev + 0.015;
        });
      }, 400);
    }
    return () => clearInterval(timer);
  }, [isSimulating]);

  // Coordinates along SVG path (Width: 360, Height: 200)
  // Route goes from Pickup (40, 150) -> via curves -> Delivery (320, 50)
  const pathD = 'M 45 150 C 100 160, 120 110, 180 100 C 240 90, 260 60, 315 50';

  // Approximate position for the motorcycle along progress
  const getBikeCoords = (p: number) => {
    // Cubic bezier interpolation approximation
    const tVal = Math.max(0, Math.min(1, p));
    const x = 45 + (315 - 45) * tVal;
    // S-curve Y calculation matching SVG path
    const y = 150 + Math.sin(tVal * Math.PI) * -60 - tVal * 40;
    return { x, y };
  };

  const bikePos = getBikeCoords(progress);
  const distanceKm = Math.max(0.2, parseFloat(((1 - progress) * 3.8).toFixed(1)));
  const etaMinutes = Math.max(2, Math.round((1 - progress) * 14));

  const openGoogleMaps = () => {
    const lat = deliveryCoords.lat;
    const lng = deliveryCoords.lng;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${pickupCoords.lat},${pickupCoords.lng}&destination=${lat},${lng}&travelmode=two-wheeler`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Telemetry HUD Header */}
      <View style={styles.hudHeader}>
        <View style={styles.telemetryBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.telemetryText}>{t.liveGpsActive}</Text>
        </View>

        <View style={styles.hudStatsRow}>
          {/* Speedometer */}
          <View style={styles.statBox}>
            <Gauge size={14} color="#00E5FF" />
            <Text style={styles.statValue}>
              {speed} <Text style={styles.statUnit}>{t.kmh}</Text>
            </Text>
          </View>

          {/* ETA */}
          <View style={styles.statBox}>
            <Compass size={14} color="#FBBF24" />
            <Text style={styles.statValue}>
              {etaMinutes} <Text style={styles.statUnit}>دقيقة</Text>
            </Text>
          </View>

          {/* Distance */}
          <View style={styles.statBox}>
            <Navigation size={14} color="#E50914" />
            <Text style={styles.statValue}>
              {distanceKm} <Text style={styles.statUnit}>كم</Text>
            </Text>
          </View>

          {/* Battery */}
          <View style={styles.statBox}>
            <BatteryCharging size={14} color="#00E676" />
            <Text style={styles.statValue}>{battery}%</Text>
          </View>
        </View>
      </View>

      {/* Interactive SVG Radar Map */}
      <View style={styles.svgMapWrapper}>
        <Svg width="100%" height={210} viewBox="0 0 360 210">
          <Defs>
            <LinearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#E50914" stopOpacity="0.4" />
              <Stop offset="50%" stopColor="#00E5FF" stopOpacity="1" />
              <Stop offset="100%" stopColor="#00E676" stopOpacity="0.9" />
            </LinearGradient>
            <LinearGradient id="radarGrid" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#1B2234" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#0C101A" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Background Map Surface */}
          <Rect x="0" y="0" width="360" height="210" rx="14" fill="url(#radarGrid)" />

          {/* Grid lines simulating city streets */}
          <Line x1="0" y1="50" x2="360" y2="50" stroke="#1F293D" strokeWidth="1" strokeDasharray="4,4" />
          <Line x1="0" y1="105" x2="360" y2="105" stroke="#1F293D" strokeWidth="1" strokeDasharray="4,4" />
          <Line x1="0" y1="160" x2="360" y2="160" stroke="#1F293D" strokeWidth="1" strokeDasharray="4,4" />
          <Line x1="90" y1="0" x2="90" y2="210" stroke="#1F293D" strokeWidth="1" strokeDasharray="4,4" />
          <Line x1="180" y1="0" x2="180" y2="210" stroke="#1F293D" strokeWidth="1" strokeDasharray="4,4" />
          <Line x1="270" y1="0" x2="270" y2="210" stroke="#1F293D" strokeWidth="1" strokeDasharray="4,4" />

          {/* Major Cairo Avenue representation */}
          <Path
            d="M 10 190 L 350 20"
            stroke="#162033"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <Path
            d="M 10 190 L 350 20"
            stroke="#22324F"
            strokeWidth="1.5"
            strokeDasharray="6,6"
          />

          {/* Street Labels */}
          <SvgText x="60" y="195" fill="#4B5563" fontSize="10" fontWeight="600">
            طريق النصر • Al Nasr Rd
          </SvgText>
          <SvgText x="190" y="32" fill="#4B5563" fontSize="10" fontWeight="600">
            عباس العقاد • Abbas El Akkad
          </SvgText>

          {/* Active Delivery Route Glow (under-layer) */}
          <Path
            d={pathD}
            stroke="#00E5FF"
            strokeWidth="8"
            strokeOpacity="0.25"
            fill="none"
            strokeLinecap="round"
          />

          {/* Active Delivery Route Path */}
          <Path
            d={pathD}
            stroke="url(#routeGradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="8,4"
          />

          {/* PICKUP PIN (Store/Bakery) */}
          <G x="45" y="150">
            <Circle r="14" fill="#E50914" fillOpacity="0.2" />
            <Circle r="8" fill="#E50914" />
            <Circle r="3" fill="#FFFFFF" />
            <SvgText x="-25" y="-12" fill="#F87171" fontSize="10" fontWeight="bold">
              استلام • Pickup
            </SvgText>
          </G>

          {/* DELIVERY PIN (Customer Destination) */}
          <G x="315" y="50">
            <Circle r="16" fill="#00E676" fillOpacity="0.2" />
            <Circle r="9" fill="#00E676" />
            <Circle r="4" fill="#FFFFFF" />
            <SvgText x="-45" y="-14" fill="#34D399" fontSize="10" fontWeight="bold">
              تسليم • Destination
            </SvgText>
          </G>

          {/* ANIMATED COURIER MOTORCYCLE */}
          <G x={bikePos.x} y={bikePos.y}>
            {/* Speed pulse circle */}
            <Circle r="15" fill="#00E5FF" fillOpacity="0.2" />
            <Circle r="9" fill="#111827" stroke="#00E5FF" strokeWidth="2" />
            {/* Inner red dot */}
            <Circle r="4" fill="#E50914" />
          </G>
        </Svg>

        {/* Live Floating Bike Badge */}
        <View
          style={[
            styles.floatingBikeLabel,
            { left: Math.min(270, Math.max(20, bikePos.x - 45)), top: Math.max(10, bikePos.y - 32) },
          ]}
        >
          <Text style={styles.floatingBikeText}>
            🏍️ فاست مان ({speed} {t.kmh})
          </Text>
        </View>
      </View>

      {/* Quick Controls & Map Switcher */}
      <View style={styles.controlsBar}>
        <TouchableOpacity
          style={[styles.controlBtn, isSimulating && styles.controlBtnActive]}
          onPress={() => setIsSimulating(!isSimulating)}
          activeOpacity={0.8}
        >
          {isSimulating ? <RotateCcw size={14} color="#00E5FF" /> : <Play size={14} color="#FFFFFF" />}
          <Text style={[styles.controlBtnText, isSimulating && { color: '#00E5FF' }]}>
            {isSimulating ? 'إيقاف الحركة' : t.simulateMovement}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navExternalBtn}
          onPress={openGoogleMaps}
          activeOpacity={0.8}
        >
          <ExternalLink size={14} color="#FFFFFF" />
          <Text style={styles.navExternalText}>{t.navigate}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F131D',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#1E2638',
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  hudHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    backgroundColor: '#141A28',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2638',
  },
  telemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E676',
    marginRight: 6,
    shadowColor: '#00E676',
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },
  telemetryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00E676',
    letterSpacing: 0.5,
  },
  hudStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  statUnit: {
    fontSize: 10,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  svgMapWrapper: {
    position: 'relative',
    height: 210,
    backgroundColor: '#0B0E17',
  },
  floatingBikeLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderColor: '#00E5FF',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    shadowColor: '#00E5FF',
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  floatingBikeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#121723',
    borderTopWidth: 1,
    borderTopColor: '#1E2638',
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: '#1E2638',
  },
  controlBtnActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderColor: 'rgba(0, 229, 255, 0.4)',
    borderWidth: 1,
  },
  controlBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navExternalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: '#E50914',
  },
  navExternalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
