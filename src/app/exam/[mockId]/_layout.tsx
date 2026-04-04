import { Stack } from 'expo-router';
import { ExamProvider } from '../../../context/ExamContext';

// Wraps all section screens for a single mock exam run in the shared ExamProvider.
// The Stack has no visible header — each section screen renders its own top bar.
export default function MockExamLayout() {
  return (
    <ExamProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="listening" />
        <Stack.Screen name="reading" />
        <Stack.Screen name="writing" />
        <Stack.Screen name="speaking" />
        <Stack.Screen name="score" />
      </Stack>
    </ExamProvider>
  );
}
