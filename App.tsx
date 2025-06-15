import React, { memo, StrictMode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Button } from '@rneui/themed';
import    AppThemeProvider   from "./theme";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Header } from "@rneui/base";
import Minesweeper from  './views/Minesweeper';


function App() {
  return (
    <StrictMode>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <GestureHandlerRootView>
            <AppThemeProvider>
              <Minesweeper />
            </AppThemeProvider>
          </GestureHandlerRootView>
        </SafeAreaView>
      </SafeAreaProvider>
    </StrictMode>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 20
  },
  textInput: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10
  }
});


export default App;
