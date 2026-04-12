import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { getDatabase } from '../services/database';
import { seedVocabularyIfEmpty } from '../services/vocabularyService';
import type { VocabularyItem } from '../types/exam';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const A1Vocab: VocabularyItem[] = require('../data/vocabulary/A1_vocabulary.json');

export default function RootLayout() {
  useEffect(() => {
    getDatabase()
      .then(() => seedVocabularyIfEmpty('A1', A1Vocab))
      .catch((err) => {
        console.error('[DB] Initialization failed:', err);
      });
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="exam/[mockId]"
            options={{ headerShown: false, presentation: 'card' }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
