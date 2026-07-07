import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FeesScreen from "@modules/fees/screens/FeesScreen";
import InvoiceDetailScreen from "@modules/fees/screens/InvoiceDetailScreen";

const Stack = createNativeStackNavigator();

export default function FeesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeesList" component={FeesScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
    </Stack.Navigator>
  );
}
