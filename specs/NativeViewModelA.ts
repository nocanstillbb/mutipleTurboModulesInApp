import {TurboModule, TurboModuleRegistry} from 'react-native';
interface SubClass
{
  subint: number;
  substr: string;
}

export interface Spec extends TurboModule {
  readonly getStr: (input: string) => string;

  readonly getObj: () => { myint: number; mydouble: number; sub:SubClass};
  readonly printObj: () => void;
}
export default TurboModuleRegistry.getEnforcing<Spec>('NativeViewModelA');


