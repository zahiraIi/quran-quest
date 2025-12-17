/**
 * Welcome message step - Personalized typewriter message.
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { impactAsync, notificationAsync, ImpactFeedbackStyle, NotificationFeedbackType } from '@/utils/haptics';

import { colors, spacing, typography, radii, shadows } from '@/theme';

interface WelcomeMessageStepProps {
  name: string;
  onComplete: () => void;
}

export function WelcomeMessageStep({ name, onComplete }: WelcomeMessageStepProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const messages = [
    `Assalamu Alaikum, ${name}! 👋`,
    'Welcome to Quran Quest.',
    "Based on your answers, we've crafted a personalized learning path just for you.",
    'Your journey to connect with the Quran starts now.',
    "May Allah make this journey easy and blessed for you. Ameen. 🤲",
  ];

  useEffect(() => {
    const currentMessage = messages[currentMessageIndex];
    let charIndex = 0;
    setDisplayedText('');
    setIsTyping(true);

    intervalRef.current = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, charIndex + 1));
        charIndex++;
        
        // Light haptic for each character
        if (charIndex % 3 === 0) {
          impactAsync();
        }
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsTyping(false);

        // Wait then move to next message or show button
        setTimeout(() => {
          if (currentMessageIndex < messages.length - 1) {
            setCurrentMessageIndex((prev) => prev + 1);
          } else {
            // All messages shown
            notificationAsync(NotificationFeedbackType.Success);
            setShowButton(true);
          }
        }, 1200);
      }
    }, 40);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentMessageIndex, name]);

  const handleComplete = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    onComplete();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.logoContainer}
        >
          <Text style={styles.logo}>📖</Text>
        </Animated.View>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            {displayedText}
            {isTyping && <Text style={styles.cursor}>|</Text>}
          </Text>
        </View>

        {/* Progress dots */}
        <View style={styles.dotsContainer}>
          {messages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentMessageIndex && styles.dotActive,
                index < currentMessageIndex && styles.dotComplete,
              ]}
            />
          ))}
        </View>
      </View>

      {/* CTA Button */}
      {showButton && (
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={styles.buttonContainer}
        >
          <Pressable
            onPress={handleComplete}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Start My Journey</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 64,
  },
  messageContainer: {
    minHeight: 120,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  message: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 36,
  },
  cursor: {
    color: colors.primary,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.backgroundMuted,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  dotComplete: {
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.xl,
    alignItems: 'center',
    ...shadows.glowPrimary,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
});

