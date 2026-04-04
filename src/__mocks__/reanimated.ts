// Minimal react-native-reanimated stub for Jest.
// Avoids loading native bindings which can exhaust heap during --no-cache runs.

const React = require('react');
const { View, Text, ScrollView, Image } = require('react-native');

function useSharedValue(initial: number) {
  return { value: initial };
}

function useAnimatedStyle(fn: () => object) {
  return fn();
}

function withTiming(val: number) {
  return val;
}

function withSpring(val: number) {
  return val;
}

function withSequence(...args: number[]) {
  return args[args.length - 1];
}

function useAnimatedRef() {
  return React.createRef();
}

function runOnJS(fn: (...args: unknown[]) => void) {
  return fn;
}

function runOnUI(fn: (...args: unknown[]) => void) {
  return fn;
}

const Animated = {
  View,
  Text,
  ScrollView,
  Image,
  createAnimatedComponent: (Component: React.ComponentType) => Component,
};

module.exports = {
  __esModule: true,
  default: Animated,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  useAnimatedRef,
  runOnJS,
  runOnUI,
  Easing: {
    linear: (t: number) => t,
    ease: (t: number) => t,
    in: (easing: (t: number) => number) => easing,
    out: (easing: (t: number) => number) => easing,
    inOut: (easing: (t: number) => number) => easing,
  },
};
