import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StudentsScreen from "@modules/students/screens/StudentsScreen";
import StudentDetailScreen from "@modules/students/screens/StudentDetailScreen";

const Stack = createNativeStackNavigator();

export default function StudentsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentsList" component={StudentsScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
    </Stack.Navigator>
  );
}
