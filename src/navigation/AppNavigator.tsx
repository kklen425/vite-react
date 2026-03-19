import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile } from '../db/repositories/progressRepo';
import { useUserStore } from '../store/useUserStore';
import { theme } from '../utils/theme';

// Screens
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PaywallScreen }    from '../screens/PaywallScreen';
import { HomeScreen }       from '../screens/HomeScreen';
import { NewWorkoutScreen } from '../screens/NewWorkoutScreen';
import { HistoryScreen }    from '../screens/HistoryScreen';
import { ProgressScreen }   from '../screens/ProgressScreen';
import { BodyScreen }       from '../screens/BodyScreen';
import { ExerciseLibraryScreen } from '../screens/ExerciseLibraryScreen';
import { SettingsScreen }   from '../screens/SettingsScreen';
import { WorkoutDetailScreen } from '../screens/WorkoutDetailScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Paywall: { fromOnboarding?: boolean };
  Main: undefined;
  WorkoutDetail: { workoutId: number };
  Settings: undefined;
  Body: undefined;
};

export type TabParamList = {
  首頁: undefined;
  新訓練: undefined;
  歷史: undefined;
  進步: undefined;
  動作庫: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
            '首頁':  focused ? 'home'         : 'home-outline',
            '新訓練': focused ? 'add-circle'   : 'add-circle-outline',
            '歷史':  focused ? 'time'          : 'time-outline',
            '進步':  focused ? 'trending-up'   : 'trending-up-outline',
            '動作庫': focused ? 'barbell'      : 'barbell-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
        tabBarActiveTintColor:   theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor:  theme.colors.border,
          borderTopWidth:  1,
        },
        tabBarLabelStyle: { fontSize: 10 },
        headerStyle:      { backgroundColor: theme.colors.background },
        headerTintColor:  theme.colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      })}>
      <Tab.Screen name="首頁"  component={HomeScreen} />
      <Tab.Screen name="新訓練" component={NewWorkoutScreen} />
      <Tab.Screen name="歷史"  component={HistoryScreen} />
      <Tab.Screen name="進步"  component={ProgressScreen} />
      <Tab.Screen name="動作庫" component={ExerciseLibraryScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'Main' | null>(null);
  const loadProfile = useUserStore(s => s.loadProfile);

  useEffect(() => {
    (async () => {
      await loadProfile();
      const profile = await getUserProfile();
      setInitialRoute(profile?.onboarding_completed ? 'Main' : 'Onboarding');
    })();
  }, [loadProfile]);

  if (!initialRoute) return null;

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle:      { backgroundColor: theme.colors.background },
        headerTintColor:  theme.colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle:     { backgroundColor: theme.colors.background },
      }}>
      <Stack.Screen name="Onboarding"     component={OnboardingScreen}     options={{ headerShown: false }} />
      <Stack.Screen name="Paywall"        component={PaywallScreen}        options={{ headerShown: false }} />
      <Stack.Screen name="Main"           component={MainTabs}             options={{ headerShown: false }} />
      <Stack.Screen name="WorkoutDetail"  component={WorkoutDetailScreen}  options={{ title: '訓練詳情' }} />
      <Stack.Screen name="Settings"       component={SettingsScreen}       options={{ title: '設定' }} />
      <Stack.Screen name="Body"           component={BodyScreen}           options={{ title: '身體數據' }} />
    </Stack.Navigator>
  );
}
