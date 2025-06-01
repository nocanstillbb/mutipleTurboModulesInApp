import React, { memo, StrictMode } from 'react';
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
  return (<StrictMode>
    <SafeAreaView style={styles.container}>
      <App />
    </SafeAreaView>
  </StrictMode>)
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



  const BtnComponent = memo(() => {
    return (
      <Button title="setstr1" onPress={p => {
        onPress1();
        prismobj.myint = prismobj.myint + 1;
        prismobj.sub.subint += 1;
        forceUpdate(v => v + 1)
      }} />
    )
  })

  return (
    <View>
      <Text style={styles.title}>
        Welcome to C++ Turbo Native Module Example {prismobj.myint}
      </Text>
      <Text>Write down here he text you want to revert {prismobj.sub.subint}</Text>

      <BtnComponent/>

      <TextInput
        style={styles.textInput}
        placeholder="Write your text here"
        onChangeText={setValue1}
        value={value1}
      />
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
