import { TurboModule, TurboModuleRegistry } from 'react-native';
import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';

export interface Mine {
  uuid: string;
  value: number;
  visual_value: number;
  isPressed: boolean;
  isLastPressed: boolean;
}
type Mines = { uuid: string, length: number; list: Array<Mine> };

type MineVM = {
  uuid: string;
  mode: number;
  row_num: number;
  col_num: number;
  mine_num: number;
  mines: Mines
};


export interface Spec extends TurboModule {

  readonly getMinesVm: () => MineVM;
  readonly open: (i: number) => void;
  readonly regen: () => void;
  readonly onValueChanged: EventEmitter<number>
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeViewModelA');


