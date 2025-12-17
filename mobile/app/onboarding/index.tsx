/**
 * Onboarding flow entry point.
 * Handles navigation through onboarding steps.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '@/theme';
import { WelcomeStep } from './steps/WelcomeStep';
import { ExperienceStep } from './steps/ExperienceStep';
import { GoalsStep } from './steps/GoalsStep';
import { MemorizationStep } from './steps/MemorizationStep';
import { TimeCommitmentStep } from './steps/TimeCommitmentStep';
import { ChallengesStep } from './steps/ChallengesStep';
import { MotivationStep } from './steps/MotivationStep';
import { NameStep } from './steps/NameStep';
import { CalculatingStep } from './steps/CalculatingStep';
import { WelcomeMessageStep } from './steps/WelcomeMessageStep';
import { OnboardingProgress } from './components/OnboardingProgress';
import { OnboardingNav } from './components/OnboardingNav';

export interface OnboardingAnswers {
  experience?: string;
  goals?: string[];
  memorization?: string;
  timeCommitment?: string;
  challenges?: string;
  motivation?: string;
  name?: string;
}

const TOTAL_STEPS = 10;

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});

  const updateAnswer = useCallback(<K extends keyof OnboardingAnswers>(
    key: K,
    value: OnboardingAnswers[K]
  ) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canContinue = useCallback(() => {
    switch (step) {
      case 0: return true; // Welcome
      case 1: return !!answers.experience;
      case 2: return (answers.goals?.length ?? 0) > 0;
      case 3: return !!answers.memorization;
      case 4: return !!answers.timeCommitment;
      case 5: return !!answers.challenges;
      case 6: return !!answers.motivation;
      case 7: return !!answers.name?.trim();
      case 8: return true; // Calculating (auto-advances)
      case 9: return true; // Welcome message
      default: return false;
    }
  }, [step, answers]);

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    }
  }, [step]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  }, [step]);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem('onboarding_complete', 'true');
      await AsyncStorage.setItem('onboarding_answers', JSON.stringify(answers));
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
      router.replace('/(tabs)');
    }
  }, [answers, router]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return <WelcomeStep onContinue={goNext} />;
      case 1:
        return (
          <ExperienceStep
            selected={answers.experience}
            onSelect={(value) => updateAnswer('experience', value)}
          />
        );
      case 2:
        return (
          <GoalsStep
            selected={answers.goals || []}
            onSelect={(value) => updateAnswer('goals', value)}
          />
        );
      case 3:
        return (
          <MemorizationStep
            selected={answers.memorization}
            onSelect={(value) => updateAnswer('memorization', value)}
          />
        );
      case 4:
        return (
          <TimeCommitmentStep
            selected={answers.timeCommitment}
            onSelect={(value) => updateAnswer('timeCommitment', value)}
          />
        );
      case 5:
        return (
          <ChallengesStep
            selected={answers.challenges}
            onSelect={(value) => updateAnswer('challenges', value)}
          />
        );
      case 6:
        return (
          <MotivationStep
            selected={answers.motivation}
            onSelect={(value) => updateAnswer('motivation', value)}
          />
        );
      case 7:
        return (
          <NameStep
            value={answers.name || ''}
            onChange={(value) => updateAnswer('name', value)}
          />
        );
      case 8:
        return <CalculatingStep onComplete={goNext} />;
      case 9:
        return (
          <WelcomeMessageStep
            name={answers.name || 'Friend'}
            onComplete={completeOnboarding}
          />
        );
      default:
        return null;
    }
  };

  // Don't show progress/nav on certain steps
  const showNav = step > 0 && step < 8;
  const showProgress = step > 0 && step < 8;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {showProgress && (
        <OnboardingProgress current={step} total={8} />
      )}

      <Animated.View
        key={step}
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(300)}
        style={styles.stepContainer}
      >
        {renderStep()}
      </Animated.View>

      {showNav && (
        <OnboardingNav
          onBack={goBack}
          onContinue={goNext}
          canContinue={canContinue()}
          showBack={step > 1}
          isLastStep={step === 7}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stepContainer: {
    flex: 1,
  },
});

