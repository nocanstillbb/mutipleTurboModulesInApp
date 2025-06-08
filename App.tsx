import React, { memo, StrictMode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ViewModelA from './specs/NativeViewModelA';
import ViewModelB from './specs/NativeViewModelB';

function SApp() {
  return (
    <StrictMode>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <App />
        </SafeAreaView>
      </SafeAreaProvider>
    </StrictMode>
  );
}

function App(): React.JSX.Element {
  //const [value, setValue] = React.useState('');
  //const [reversedValue, setReversedValue] = React.useState('');
  //const onPress = () => {
  //  const revString = SampleTurboModule.reverseString(value);
  //  setReversedValue(revString);
  //};

  const [value1, setValue1] = React.useState('');
  const [str1Value, setStr1Value] = React.useState('');
  const onPress1 = () => {
    const str1 = ViewModelA.getStr(value1);
    setStr1Value(v=>v=str1);
  }


  const [value2, setValue2] = React.useState('');
  const [str2Value, setStr2Value] = React.useState('');
  const onPress2 = () => {
    const str2 = ViewModelB.getStr(value2);
    setStr2Value(str2);
  };


  const [prismobj,_] = React.useState(ViewModelA.getObj);
  const [__,forceUpdate] = React.useState(0);

  const clickedFuna = React.useCallback(() => {
        onPress1();
        prismobj.sub_list.list[1].subint = prismobj.sub_list.list[1].subint + 1
        prismobj.sub_list.list[1].substr = prismobj.sub_list.list[1].substr + 1

        forceUpdate(v => v + 1)
      },[]);

  const BtnComponent = memo(() => {
    return (
      <Button title="setstr1" onPress={clickedFuna} />
    )
  })

  return (
    <View>
      <Text style={styles.title}>
        Welcome to C++ Turbo Native Module Example {prismobj.myint}
      </Text>
    <Text>.sub.substr   :{prismobj.sub_list.list[1].substr}</Text>
    <Text>.sub.subint   :{prismobj.sub_list.list[1].subint}</Text>


      <TextInput
        style={styles.textInput}
        placeholder="Write your text here"
        onChangeText={setValue1}
        value={value1}
      />
      <BtnComponent/>
      <Button title="print" onPress={() => ViewModelA.printObj()} />
      <Text>Reversed text: {str1Value}</Text>

      <TextInput
        style={styles.textInput}
        placeholder="Write your text here"
        onChangeText={setValue2}
        value={value2}
      />
      <Button title="setstr1" onPress={onPress2} />
      <Text>Reversed text: {str2Value}</Text>

    </View>
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
    marginBottom: 20,
  },
  textInput: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
});

export default SApp;
