import ViewModelA from '../../specs/NativeViewModelA';
import { EventSubscription, TouchableOpacity ,Keyboard} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useLayoutEffect, useRef, useCallback, useReducer, Fragment, useMemo } from 'react';
import { Button, color } from '@rneui/base';
import { Icon, Dialog, CheckBox, Input } from '@rneui/themed';

import { LayoutChangeEvent, TouchableWithoutFeedback, FlatList, Text, View, StyleSheet, Dimensions, Alert } from 'react-native';
import Animated, {
      useAnimatedRef,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
  measure,
} from 'react-native-reanimated';

import { GestureHandlerRootView, Gesture, GestureDetector, PanGestureHandler, PinchGestureHandler, TextInput } from 'react-native-gesture-handler';
import React from 'react';
import { Scale } from '../../theme/Scale';

import { identity3, Matrix3, multiply3 } from 'react-native-redash';

function translateMatrix(matrix: Matrix3, x: number, y: number) {
  'worklet';
  return multiply3(matrix, [1, 0, x, 0, 1, y, 0, 0, 1]);
}

function scaleMatrix(matrox: Matrix3, value: number) {
  'worklet';
  return multiply3(matrox, [value, 0, 0, 0, value, 0, 0, 0, 1]);
}


function binding<T>(
    item: { [key: string]: any; register: (key: string, cb: (v: T) => void) => string; unregister: (id: any) => string },
    key: string
): [T, Function] {
    const [value, setValue] = useState(item[key]);

    useEffect(() => {
        const id = item.register(key, setValue);
        return () => {
            item.unregister(id);
        }
    }, []);

    return [value, setValue];
}




export default function Minesweeper(): React.JSX.Element {
    const vm = ViewModelA.getMinesVm()
    const mines = vm.mines.list;

    const numRows = vm.row_num;
    const numColumns = vm.col_num;

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    const [cellSize, setCellSize] = binding(vm, "cellPixcelSize")
    const actualHeight = cellSize * numRows;
    const actualWidth = cellSize * numColumns;

    var MIN_SCALE = 0.5;
    const MAX_SCALE = 8;
    const insets = useSafeAreaInsets();


    const [settingDilogOpen, setSettingDilogOpen] = useState(false);

    //if (actualHeight > actualWidth) {
    //    MIN_SCALE = screenHeight / actualHeight;
    //}
    //else {
    //    MIN_SCALE = screenWidth / actualWidth;
    //}


    const LabelInput = React.memo(({ label, obj,prop }: { label: string, obj:any,prop: string}) => {
        const [value, setValue] = binding(obj, prop)
        const [tmpdiff, setTemdiff] = binding(vm, "tmp_difficulties")

        return(
            <View style={{ flexDirection: "row", height: 30, alignContent: "center", justifyContent: 'center' }} >
                <Text style={{ color:(()=>{ return tmpdiff!=3 ?"lightgray":"black"})(), textAlign: 'center', padding: Scale.width(8), fontSize: Scale.font(16), marginRight: Scale.width(5), marginLeft: Scale.width(5) }}>{label}</Text>
                <TextInput
                readOnly={tmpdiff != 3 }
                    style={[{color:(()=>{ return tmpdiff!=3 ?"lightgray":"black"})(), flex: 1, marginRight: Scale.width(80), borderWidth: Scale.width(1), borderColor: '#ccc', padding: Scale.width(8), borderRadius: Scale.width(4), fontSize: Scale.font(16) }]}
                    keyboardType="numeric" // 数字键盘
                    value={String(value)}
                    onChangeText={(text) => {
                        obj[prop] = Number(text.replace(/[^0-9]/g, ''))
                    }}
                />
            </View>
        )
    })

    const SettingDialog = React.memo(({ isopen, setIsopen }: { isopen: boolean, setIsopen: Function }) => {
        const [tmpdiff, setTmpDifficulties] = binding(vm, "tmp_difficulties")
        return (<Dialog
            isVisible={isopen}
            onShow={() => {
                setTmpDifficulties(vm.difficulties)
            }}
            onBackdropPress={() => {
                //setIsopen(false)
                Keyboard.dismiss();
            }}
        >
            <Dialog.Title title="参数设置" />
            {['1', '2', '3','4'].map((l, i) => (
                <CheckBox
                    key={i}
                    textStyle={{ color: 'gray', fontSize: Scale.font(16) }} 
                    title={
                        (() => {
                            switch (i) {
                                case 0:
                                    return "简单 (8x8,10雷)";
                                case 1:
                                    return "中等 (16x16,40雷)";
                                case 2:
                                    return "困难 (16x30,99雷)";
                                case 3:
                                    return "自定义";
                                default:
                                    return "";
                            }
                        })()
                    }
                    containerStyle={{ backgroundColor: 'white', borderWidth: 0 }}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    checkedColor='gray'
                    checked={tmpdiff === i}
                    onPress={() => {
                        switch (i) {
                            case 0:
                                //return "简单 (8x8,10雷)";
                                vm.row_num = 8;
                                vm.col_num = 8;
                                vm.mine_num = 10;
                                break;
                            case 1:
                                //return "中等 (16x16,40雷)";
                                vm.row_num = 16;
                                vm.col_num = 16;
                                vm.mine_num = 40;
                                break;
                            case 2:
                                //return "困难 (16x30,99雷)";
                                vm.row_num = 16
                                vm.col_num = 30
                                vm.mine_num = 99
                                break;
                            case 3: //自定义
                                break;
                            default:
                            //return "";
                        }

                        vm.tmp_difficulties = i
                    }}
                />)) }

            <View style={{ gap: 10 }}>
                <LabelInput label='行数' obj={vm}  prop='row_num'  />
                <LabelInput label='列数' obj={vm}  prop='col_num'  />
                <LabelInput label='雷数' obj={vm}  prop='mine_num'  />
            </View>

            <Dialog.Actions>
                <Dialog.Button
                    title="确认"
                    titleStyle={[{ color: "gray" }]} 
                    onPress={() => {
                        vm.difficulties = vm.tmp_difficulties
                        switch (tmpdiff) {
                            case 0:
                                //return "简单 (8x8,10雷)";
                                vm.row_num = 8;
                                vm.col_num = 8;
                                vm.mine_num = 10;
                                break;
                            case 1:
                                //return "中等 (16x16,40雷)";
                                vm.row_num = 16;
                                vm.col_num = 16;
                                vm.mine_num = 40;
                                break;
                            case 2:
                                //return "困难 (16x30,99雷)";
                                vm.row_num = 16
                                vm.col_num = 30
                                vm.mine_num = 99
                                break;
                            case 3: //自定义
                                break;
                            default:
                            //return "";
                        }
                        ViewModelA.initCells()
                        ViewModelA.regen()
                        vm.cellPixcelSize = vm.cellPixcelSize * scale.value
                        setTimeout(() => {
                            transform.value = identity3
                            translation.value = { x: 0, y: 0 },
                            scale.value = 1
                        }, 1);
                        setIsopen(false)
                    }}
                />
                <Dialog.Button titleStyle={[{color:"gray"}]}  title="取消" onPress={() => setIsopen(false)} />
            </Dialog.Actions>
        </Dialog>);
    })


    const FloatButton = React.memo(() => {
        const [vv, setMode] = binding(vm, "mode")


        return (
            <TouchableOpacity onPress={() => {
                vm.mode ^= 1
            }} style={{ position: 'absolute', left: 0, bottom: 0, width: 100, height: 100, padding: Scale.width(8) }} >
                <Icon
                    type='font-awesome'
                    name='flag'
                    size={40}
                    color={vm.mode ? "red" : "gray"} >
                </Icon>
            </TouchableOpacity>
        );
    })
    const FloatButton_right = React.memo(() => {
        const [vv, setMode] = binding(vm, "mode")
        return (
            
            <TouchableOpacity onPress={() => {
                setSettingDilogOpen(true)
            }} style={{ position: 'absolute', right: 0, bottom: 0, width: 100, height: 100, padding: Scale.width(8) }} >
                <Icon
                    type='font-awesome'
                    name='gear'
                    size={40}
                    color="gray" >
                </Icon>
            </TouchableOpacity>

        );
    })


    const renderitem = useCallback(
        ({ item, index }: { item: typeof mines[0]; index: number }) => <RenderItem item={item} index={index} />,
        []
    )
    const RenderItem = React.memo(({ item, index }: { item: typeof mines[0], index: number }) => {

        const [vv, setVv] = binding(item, "visual_value");
        const [pressed, setPressed] = binding(item, "isPressed");
        useEffect(() => {
            if (pressed) {
                const timer = setTimeout(() => {
                    item.isPressed = false
                }, 100);

                return () => clearTimeout(timer); // 清理旧的定时器
            }
        }, [pressed]);
        const [cellSize, setCellSize] = binding(vm, "cellPixcelSize")
        return (
            <TouchableWithoutFeedback onPress={() => {
                ViewModelA.open(index)
            }}>
                <View style={[{ width: cellSize, height: cellSize }, styles.item]}>
                    <View style={[{
                        backgroundColor: (() => {
                            if (vv == 10)
                                return "red";
                            else if (pressed)
                                return "#f0f0f0";
                            else if (vv != -1 && vv != 9 && vv != 11 && vv != 12)
                                return "transparent"
                            return "#e0e0e0";
                        })(),
                        position: "absolute",
                        top: (()=>{return cellSize *0.05})(),
                        right: (()=>{return cellSize *0.05})(),
                        bottom: (()=>{return cellSize *0.05})(),
                        left: (()=>{return cellSize *0.05})(),
                        //top: (Math.floor(index / numColumns) !== 0 && Math.floor(index / numColumns) === 0 ? 0 : 3),
                        //left: (Math.floor(index % numColumns) !==0 && Math.floor(index % numColumns) === 0 ? 0 : 3),
                        //right: 0,
                        //bottom: (Math.floor(index / numColumns) !== vm.row_num) === 0 ? 0 : 3,
                        flex: 1,
                        justifyContent: "center"
                    }]} >
                        <Text
                            style={[styles.text, {
                                color: (() => {
                                    if (vv === 1)
                                        return "#0100fe"
                                    else if (vv === 2)
                                        return "#017f01"
                                    else if (vv === 3)
                                        return "#fe0000"
                                    else if (vv === 4)
                                        return "#010080"
                                    else if (vv === 5)
                                        return "#810102"
                                    else if (vv === 6)
                                        return "#008081"
                                    else if (vv === 7)
                                        return "#000000"
                                    else if (vv === 8)
                                        return "#808080"
                                    else
                                        return "black"
                                })()
                                ,
                                fontSize: Scale.font(cellSize / 2.5),
                                fontWeight: 'bold'
                            }]}

                        >
                            {
                                vv === 9 || vv === 10 ? "💣"
                                    : vv === -1 || vv === 0 ? ""
                                        : vv === 11 ? "🚩"
                                            : vv === 12 ? "❓"
                                                : vv?.toString()
                            }
                        </Text>

                        <View
                            style={{
                                backgroundColor: "transparent",
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <View style={{ width: '100%', height: '100%' }} />
                        </View>

                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    });



    const MineNumber = React.memo(() => {
        const [flag_num, setFlagNumber] = binding(vm, "flag_num")
        return (
            <View style={{ flexDirection: 'row', backgroundColor: "black" ,padding:Scale.width(2)}}>
                <Text style={{ color: "red", fontFamily: 'Digital-7 Mono', fontSize: Scale.font(44) }}>
                {String(vm.mine_num - flag_num).padStart(3, '0')}
                </Text>
            </View>
        );
    })

    const Timecomponent = React.memo(() => {
        const [eTime_ms, setETime] = binding(vm, "eTime_ms")
        return (
            <View style={{ flexDirection: 'row', backgroundColor: "black" ,padding:Scale.width(2)}}>
                <Text style={{ color: "red", fontFamily: 'Digital-7 Mono', fontSize: Scale.font(44) }}>
                    {String(Math.floor(eTime_ms / 1000)).padStart(3, '0')}{/** .{String(Math.floor((eTime_ms % 1000) / 10.0)).padStart(2, '0')}*/}
                </Text>
            </View>
        );
    })



    const ref = useAnimatedRef();
    const origin = useSharedValue({ x: 0, y: 0 });
    const transform = useSharedValue(identity3);
    const scale = useSharedValue(1);
    const translation = useSharedValue({ x: 0, y: 0 });


    const pan = Gesture.Pan()
        .averageTouches(true)
        .onChange((event) => {
            translation.value = {
                x: event.translationX,
                y: event.translationY,
            };
        })
        .onEnd(() => {
            let matrix = identity3;
            matrix = translateMatrix(
                matrix,
                translation.value.x,
                translation.value.y
            );
            transform.value = multiply3(matrix, transform.value);
            translation.value = { x: 0, y: 0 };
        });


    const pinch = Gesture.Pinch()
        .onStart((event) => {
            const measured = measure(ref);
            origin.value = {
                x: event.focalX - measured.width / 2,
                y: event.focalY - measured.height / 2,
            };
        })
        .onChange((event) => {
            scale.value = event.scale;
        })
        .onEnd(() => {
            let matrix = identity3;
            matrix = translateMatrix(matrix, origin.value.x, origin.value.y);
            matrix = scaleMatrix(matrix, scale.value);
            matrix = translateMatrix(matrix, -origin.value.x, -origin.value.y);
            transform.value = multiply3(matrix, transform.value);
            scale.value = 1;
        });

    const animatedStyle = useAnimatedStyle(() => {
        let matrix = identity3;

        if (translation.value.x !== 0 || translation.value.y !== 0) {
            matrix = translateMatrix(
                matrix,
                translation.value.x,
                translation.value.y
            );
        }

        if (scale.value !== 1) {
            matrix = translateMatrix(matrix, origin.value.x, origin.value.y);
            matrix = scaleMatrix(matrix, scale.value);
            matrix = translateMatrix(matrix, -origin.value.x, -origin.value.y);
        }

        matrix = multiply3(matrix, transform.value);

        return {
            transform: [
                { translateX: matrix[2] },
                { translateY: matrix[5] },
                { scaleX: matrix[0] },
                { scaleY: matrix[4] },
            ],
        };
    });

    return (

        <View style={{ flex: 1 }}>
            {/* 顶部 safe area 区域背景色 */}
            <View style={{ height: insets.top - 12, width: screenWidth, backgroundColor: (() => styles.noneClinetArea.color)() }} ></View>

            {/* 主内容区域 */}
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={{
                    position: 'absolute',
                    //left: -screenWidth / 2,
                    left: 0,
                    top: 0,
                    width: screenWidth,
                    height: screenHeight - insets.top + 12,
                    // height: screenHeight - insets.bottom - insets.top, 
                    overflow: 'hidden',
                }}>


                    <View style={[styles.insetBox, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: (() => styles.noneClinetArea.color)() }]}>

                        <View style={{ flexDirection: 'row', flex: 1, flexGrow: 1 }}>

                            <MineNumber />
                                                                                                                      
                            <View style={{ flex: 1, flexGrow: 1 }}></View>
                        </View>
                      <Button
                            onPress={() => {
                                ViewModelA.regen()
                                vm.cellPixcelSize = vm.cellPixcelSize * scale.value
                                setTimeout(() => {
                                    transform.value = identity3
                                    translation.value = { x: 0, y: 0 },
                                    scale.value = 1
                                }, 1);
                            }}
                            title="🙂"
                            buttonStyle={{
                                borderColor: 'rgba(78, 116, 289, 1)',
                            }}
                            type="outline"
                            raised
                            titleStyle={{ color: 'rgba(78, 116, 289, 1)' }}
                            containerStyle={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginHorizontal: 0,
                                marginVertical: 0,
                            }}
                        />
                        <View style={{ flexDirection: 'row', flex: 1, flexGrow: 1 }}>
                            <View style={{ flex: 1, flexGrow: 1 }}></View>

                            <Timecomponent />
                                                                                                                      
                        </View>
                        

                    </View>


                    <GestureDetector gesture={Gesture.Simultaneous(pinch, pan)}>
                        <Animated.View
                            ref={ref}
                            collapsable={false}
                            style={[{overflow: 'hidden', flex: 1, width: actualWidth + (vm.col_num - 1) * 0.2,backgroundColor: (() => styles.noneClinetArea.color2)() }]}>

                            <Animated.View style={[animatedStyle, { width: actualWidth + (vm.col_num - 1) * 0.2, height: actualHeight + (vm.row_num - 1) * 0.5, borderWidth: 3, borderColor: "lightgray" }]}>
                                <View>
                                    <FlatList
                                        data={mines}
                                        bounces={false}
                                        overScrollMode="never"
                                        key={`${numRows}-${numColumns}`}
                                        contentContainerStyle={[styles.flatlist, { width: actualWidth, height: actualHeight }]}
                                        renderItem={renderitem}
                                        numColumns={numColumns}
                                        initialNumToRender={mines.length}
                                        keyExtractor={(item) => item.uuid}
                                        scrollEnabled={false} // 禁止内建滚动，靠 pan 拖动
                                    />
                                </View>
                            </Animated.View>

                        </Animated.View>
                    </GestureDetector>

      

                {/**
                    <GestureHandlerRootView
                        style={
                            {
                                flex: 1,
                                overflow: "hidden",
                                backgroundColor: (() => styles.noneClinetArea.color2)()
                            }
                        }
                    >

                        <PinchGestureHandler onGestureEvent={pinchHandler} ref={pinchRef} simultaneousHandlers={panRef} enabled={pinchEnabled} >
                            <Animated.View  style={{overflow:'hidden'}}>
                                <PanGestureHandler onGestureEvent={panHandler} ref={panRef} simultaneousHandlers={pinchRef} enabled={panEnabled}  >
                                    <Animated.View style={[animatedStyle, { width: actualWidth + (vm.col_num - 1) * 0.2, height: actualHeight + (vm.row_num - 1) * 0.5, borderWidth: 3, borderColor: "lightgray" }]}>
                                        <FlatList
                                            data={mines}
                                            bounces={false}
                                            overScrollMode="never"
                                            key={`${numRows}-${numColumns}`}
                                            contentContainerStyle={[styles.flatlist, { width: actualWidth, height: actualHeight }]}
                                            renderItem={renderitem}
                                            numColumns={numColumns}
                                            initialNumToRender={mines.length}
                                            keyExtractor={(item) => item.uuid}
                                            scrollEnabled={false} // 禁止内建滚动，靠 pan 拖动
                                        />
                                    </Animated.View>
                                </PanGestureHandler>
                            </Animated.View>
                        </PinchGestureHandler>
                    </GestureHandlerRootView>
                 */}
                </View>
            </View>

            {/* 底部 safe area 区域背景色 */}
            {/*<View style={{ height: insets.bottom, backgroundColor: (()=> styles.noneClinetArea.color)() }} ></View> */}
            <FloatButton />

            <FloatButton_right />

            <SettingDialog isopen={settingDilogOpen} setIsopen={setSettingDilogOpen} />


        </View>




    );
}

const styles = StyleSheet.create({
    noneClinetArea: {
        color: "#lightgray",
        color2: "#gray",
    },
    flatContainer: {
        //flex: 1,
        backgroundColor: "#33101010",
    },
    flatlist: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        //width: actualWidth,
        //height: actualHeight

    },
    item: {
        borderWidth: 1,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        overflow: "hidden"
    },
    text: {
        textAlign: 'center',
        textAlignVertical: "center",
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: Scale.font(16),
    },
    insetBox: {
        width: 150,
        height: 50,
        backgroundColor: '#e0e0e0',
        borderRadius: 0,
        // 模拟 inner shadow
        shadowColor: '#000',
        shadowOffset: { width: -5, height: -5 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 10,

        // 叠加暗角
        borderWidth: 1,
        borderColor: '#a3a3a3',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
