import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';

import {SubscriptionListScreen} from '../features/subscriptions/screens/SubscriptionListScreen';
import {SubscriptionDetailScreen} from '../features/subscriptions/screens/SubscriptionDetailScreen';
import {SubscriptionFormScreen} from '../features/subscriptions/screens/SubscriptionFormScreen';
import {CredentialFormScreen} from '../features/credentials/screens/CredentialFormScreen';
import {SettingsScreen} from '../features/settings/screens/SettingsScreen';
import {useTranslation} from 'react-i18next';
import {colors} from '../lib/theme';
import type {RootStackParamList, MainTabParamList} from '../lib/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const {t} = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: {backgroundColor: colors.surface},
        headerTintColor: colors.text,
      }}>
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionListScreen}
        options={{
          title: t('tabs.subscriptions'),
          tabBarIcon: ({color}) => (
            <Text style={{fontSize: 20, color}}>{'📋'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({color}) => (
            <Text style={{fontSize: 20, color}}>{'⚙️'}</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: colors.surface},
          headerTintColor: colors.text,
        }}>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SubscriptionForm"
          component={SubscriptionFormScreen}
        />
        <Stack.Screen
          name="SubscriptionDetail"
          component={SubscriptionDetailScreen}
        />
        <Stack.Screen
          name="CredentialForm"
          component={CredentialFormScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
