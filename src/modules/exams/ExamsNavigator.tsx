import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExamsScreen from "@modules/exams/screens/ExamsScreen";
import ExamDetailScreen from "@modules/exams/screens/ExamDetailScreen";

const Stack = createNativeStackNavigator();

export default function ExamsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExamsList" component={ExamsScreen} />
      <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
    </Stack.Navigator>
  );
}
