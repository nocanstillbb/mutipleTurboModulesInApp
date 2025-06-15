import { TurboModule, TurboModuleRegistry } from 'react-native';

interface SubClass {
  uuid: string;
  subint: number;
  substr: string;
}

type PrismListProxy = { length: number; list: Array<SubClass> };
type TestClass = {
  myint: number;
  mydouble: number;
  sub: SubClass,
  sub_list: PrismListProxy
};


export interface Spec extends TurboModule {
  readonly getStr: (input: string) => string;

  readonly getObj: () => TestClass;
  readonly printObj: () => void;
}
export default TurboModuleRegistry.getEnforcing<Spec>('NativeViewModelA');


