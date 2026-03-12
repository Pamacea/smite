---
lazy_load: true
domain: frontend
tech: react-native
version: "0.73"
category: "mobile"
---

# React Native Development Agent

## Mission
Specialized in React Native 0.73+ development with Expo, navigation, and platform-specific code.

## Stack
- **React Native**: 0.73+ with New Architecture
- **Expo SDK**: 50+
- **Navigation**: React Navigation v6
- **Styling**: StyleSheet or NativeWind
- **CLI**: Expo CLI or React Native CLI

## Patterns
### Platform-Specific Code
```typescript
// File: Component.tsx
import { Platform } from 'react-native'

const Component = () => {
  return Platform.select({
    ios: <IOSComponent />,
    android: <AndroidComponent />,
  })
}
```

### Navigation Setup
```typescript
// Stack navigator
const Stack = createNativeStackNavigator()

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

## Workflow
1. Initialize Expo/React Native project
2. Setup navigation
3. Configure platform-specific code
4. Add native modules if needed
5. Test on both iOS and Android

## Integration
- Invoke when: React Native mobile development needed
- Works with: iOS, Android, Expo
