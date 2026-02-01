import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import {SubscriptionListScreen} from '../features/subscriptions/screens/SubscriptionListScreen';
import {SubscriptionDetailScreen} from '../features/subscriptions/screens/SubscriptionDetailScreen';
import {SubscriptionFormScreen} from '../features/subscriptions/screens/SubscriptionFormScreen';
import {CredentialFormScreen} from '../features/credentials/screens/CredentialFormScreen';
import {TemplatePickerScreen} from '../features/subscriptions/screens/TemplatePickerScreen';
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
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        headerStyle: {backgroundColor: colors.background},
        headerTintColor: colors.text,
      }}>
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionListScreen}
        options={{
          title: t('tabs.subscriptions'),
          tabBarIcon: ({color, size}) => (
            <Ionicons name="card-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({color, size}) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const {t} = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: colors.background},
          headerTintColor: colors.text,
          contentStyle: {backgroundColor: colors.background},
          headerBackTitle: t('common.back'),
        }}>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TemplatePicker"
          component={TemplatePickerScreen}
          options={{title: t('templates.title')}}
        />
        <Stack.Screen
          name="SubscriptionForm"
          component={SubscriptionFormScreen}
          options={{title: t('subscriptions.addNew')}}
        />
        <Stack.Screen
          name="SubscriptionDetail"
          component={SubscriptionDetailScreen}
          options={{title: t('subscriptions.detail')}}
        />
        <Stack.Screen
          name="CredentialForm"
          component={CredentialFormScreen}
          options={{title: t('credentials.add')}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
