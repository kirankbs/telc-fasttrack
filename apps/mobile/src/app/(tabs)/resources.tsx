import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from '../../utils/theme';

interface ResourceItem {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description: string;
  url: string;
  accentColor: string;
}

const RESOURCES: ResourceItem[] = [
  {
    icon: 'school-outline',
    title: 'telc.net Official Mocks',
    description: 'Free sample papers from the exam provider',
    url: 'https://www.telc.net/pruefungen/deutsch/a1/uebungstest-1.html',
    accentColor: colors.primary,
  },
  {
    icon: 'file-pdf-box',
    title: 'Goethe A1 Wortliste',
    description: 'The official 650-word vocabulary list',
    url: 'https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_A1_Wortliste.pdf',
    accentColor: colors.levelB1,
  },
  {
    icon: 'television-play',
    title: "Deutsche Welle — Nico's Weg",
    description: 'Free A1 video course with exercises',
    url: 'https://learngerman.dw.com/de/nicos-weg/s-53095313',
    accentColor: colors.levelA2,
  },
  {
    icon: 'laptop',
    title: 'Schubert Verlag Exercises',
    description: 'Online grammar and vocabulary drills',
    url: 'https://www.schubert-verlag.de/aufgaben/uebungen_a1/a1_index.htm',
    accentColor: colors.levelA1,
  },
];

export default function ResourcesScreen() {
  const insets = useSafeAreaInsets();

  async function openUrl(url: string, title: string) {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      console.warn(`[Resources] Cannot open URL for: ${title}`);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.base,
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Resources</Text>
      <Text style={styles.screenSubtitle}>
        Official materials and trusted study sites
      </Text>

      {RESOURCES.map((resource) => (
        <TouchableOpacity
          key={resource.url}
          style={styles.resourceCard}
          activeOpacity={0.85}
          onPress={() => openUrl(resource.url, resource.title)}
        >
          <View
            style={[
              styles.iconBox,
              { backgroundColor: resource.accentColor + '18' },
            ]}
          >
            <MaterialCommunityIcons
              name={resource.icon}
              size={24}
              color={resource.accentColor}
            />
          </View>
          <View style={styles.resourceText}>
            <Text style={styles.resourceTitle}>{resource.title}</Text>
            <Text style={styles.resourceDescription}>{resource.description}</Text>
          </View>
          <MaterialCommunityIcons
            name="open-in-new"
            size={18}
            color={colors.textDisabled}
          />
        </TouchableOpacity>
      ))}

      <View style={styles.disclaimer}>
        <MaterialCommunityIcons
          name="information-outline"
          size={16}
          color={colors.textSecondary}
        />
        <Text style={styles.disclaimerText}>
          External links open in your browser. These are third-party sites not
          affiliated with this app.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  screenTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resourceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    ...shadows.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resourceText: {
    flex: 1,
    gap: 2,
  },
  resourceTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  resourceDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  disclaimerText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
  },
});
