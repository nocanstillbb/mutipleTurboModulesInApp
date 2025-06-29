import ViewModelA from '../../specs/NativeViewModelA';
import { EventSubscription } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useLayoutEffect, useRef, useCallback, useReducer } from 'react';
import { Button, color } from '@rneui/base';
  
import {LayoutChangeEvent,TouchableWithoutFeedback, FlatList, Text, View, StyleSheet, Dimensions, Alert } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
    runOnJS,
} from 'react-native-reanimated';

import {GestureHandlerRootView, Gesture, GestureDetector, PanGestureHandler, PinchGestureHandler, TextInput } from 'react-native-gesture-handler';


const vm = ViewModelA.getMinesVm()
const mines = vm.mines.list;

const numRows = vm.row_num;
const numColumns = vm.col_num;

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const cellSize = 40;
const actualHeight = cellSize * numRows;
const actualWidth = cellSize * numColumns;

var MIN_SCALE = 1;
const MAX_SCALE = 8;



export default function Minesweeper(): React.JSX.Element {

    if (actualHeight > actualWidth) {
        MIN_SCALE = screenHeight / actualHeight;
    }
    else {
        MIN_SCALE = screenWidth / actualWidth;
    }

    const [pinchEnabled, setPinchEnabled] = useState(true);
    const [panEnabled, setPanEnabled] = useState(true);


    const scale = useSharedValue(1);
    //const scale = useSharedValue(MIN_SCALE);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const x_basi = useSharedValue(0);
    const y_basi = useSharedValue(0);
    const xyHand = useSharedValue(0)

    const pre_focalDeltaX = useSharedValue(0);
    const pre_focalDeltaY = useSharedValue(0);
    const pre_eventFocalX = useSharedValue(0);
    const pre_eventFocalY = useSharedValue(0);


    const pre_numberofpointer = useSharedValue(0)



    const pinchRef = useRef(null);
    const panRef = useRef(null);

    const insets = useSafeAreaInsets();






    const pinchHandler = useAnimatedGestureHandler<any>({
        onStart: (event, ctx: any) => {
            console.log(1111111)
            ctx.startScale = scale.value;
            ctx.startOffsetX = offsetX.value;
            ctx.startOffsetY = offsetY.value;
            ctx.focalX = event.focalX;
            ctx.focalY = event.focalY;
            xyHand.value = -1
        },
        onActive: (event, ctx: any) => {
            console.log(1111112)

            let focalDeltaX = event.focalX - ctx.focalX;
            let focalDeltaY = event.focalY - ctx.focalY;

            let newScale = ctx.startScale * event.scale;



            newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
            let scaleDiff = newScale / ctx.startScale;

            if (event.numberOfPointers >= 2 &&
                (Math.abs(scale.value - newScale) <= 0.01) &&
                ((Math.abs(scaleDiff*(pre_eventFocalX.value - event.focalX)) > screenWidth/20)  ||
                (Math.abs(scaleDiff*(pre_eventFocalY.value - event.focalY)) > screenWidth /20))) {

                return
            }


            if (pre_numberofpointer.value != event.numberOfPointers) {
                console.log(22222222)
                if (event.numberOfPointers < 2) {
                    console.log(22222223)
                    console.log(22222223)
                    x_basi.value = pre_eventFocalX.value - event.focalX
                    y_basi.value = pre_eventFocalY.value - event.focalY 


                }
                else {
                    console.log(22222224)
                    x_basi.value = 0
                    y_basi.value = 0

                    ctx.startScale = scale.value;
                    ctx.startOffsetX = offsetX.value;
                    ctx.startOffsetY = offsetY.value;
                    ctx.focalX = event.focalX;
                    ctx.focalY = event.focalY;

                    focalDeltaX = event.focalX - ctx.focalX;
                    focalDeltaY = event.focalY - ctx.focalY;

                    newScale = ctx.startScale * event.scale;
                    newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
                    scaleDiff = newScale / ctx.startScale;

                    offsetX.value = x_basi.value + ctx.startOffsetX + focalDeltaX + (scaleDiff - 1) * ((actualWidth / 2) - ctx.focalX + ctx.startOffsetX) ;
                    offsetY.value = y_basi.value + ctx.startOffsetY + focalDeltaY + (scaleDiff - 1) * ((actualHeight / 2) - ctx.focalY + ctx.startOffsetY) ;

                    scale.value = newScale;

                    pre_focalDeltaX.value = focalDeltaX
                    pre_focalDeltaY.value = focalDeltaY
                    pre_eventFocalX.value = event.focalX
                    pre_eventFocalY.value = event.focalY



                }
            }


            console.log(1111113)


            offsetX.value =  x_basi.value + ctx.startOffsetX + focalDeltaX + (scaleDiff - 1) * ((actualWidth / 2) - ctx.focalX + ctx.startOffsetX) ;
            offsetY.value =  y_basi.value + ctx.startOffsetY + focalDeltaY + (scaleDiff - 1) * ((actualHeight / 2) - ctx.focalY + ctx.startOffsetY) ;


            pre_numberofpointer.value = event.numberOfPointers
            pre_focalDeltaX.value = focalDeltaX
            pre_focalDeltaY.value = focalDeltaY
            pre_eventFocalX.value = event.focalX
            pre_eventFocalY.value = event.focalY

            scale.value = newScale;


            xyHand.value = -1

        },
    })


    const panHandler = useAnimatedGestureHandler({
        onStart: (event, ctx: any) => {
            console.log(1111115)
            ctx.startX = offsetX.value;
            ctx.startY = offsetY.value;
            ctx.translationX0 = event.translationX
            ctx.translationY0 = event.translationY
            xyHand.value = 1

        },
        onActive: (event, ctx: any) => {
            console.log(1111116)

            if (xyHand.value == 1 ) {
              console.log(1111117)
              offsetX.value = ctx.startX + event.translationX - ctx.translationX0 
              offsetY.value = ctx.startY + event.translationY - ctx.translationY0 
              //offsetX.value = ctx.startX + event.translationX - ctx.translationX0 + focalX.value;
              //offsetY.value = ctx.startY + event.translationY - ctx.translationY0 + focalY.value;

            }
            else {
                console.log(1111118)
            }

        },
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offsetX.value },
                { translateY: offsetY.value },
                { scale: scale.value },
            ],
        };
    });


    const RenderItem = ({ item, index }: { item: typeof mines[0], index: number }) => {


        const [_, forceupdate] = useState(item);
        item.notifyUI = forceupdate;
        return (
            <TouchableWithoutFeedback onPress={() => {
                console.log('点击了' + index)
                ViewModelA.open(index)
            }}>
                <View style={[{ width: cellSize, height: cellSize }, styles.item]}>
                    <View style={[{
                        backgroundColor: (() => {
                            if (item.visual_value == 10)
                                return "red";
                            else if (item.visual_value != -1)
                                return "transparent"
                            return "#e0e0e0";
                        })(),
                        position: "absolute",
                        top: (Math.floor(index / numColumns) === 0 ? 0 : 3),
                        left: (Math.floor(index % numColumns) === 0 ? 0 : 3),
                        right: 0,
                        bottom: 0,
                        flex: 1,
                        justifyContent: "center"
                    }]} >
                        <Text
                            style={[styles.text, {
                                color: (() => {
                                    if (item.visual_value === 1)
                                        return "#0100fe"
                                    else if (item.visual_value === 2)
                                        return "#017f01"
                                    else if (item.visual_value === 3)
                                        return "#fe0000"
                                    else if (item.visual_value === 4)
                                        return "#010080"
                                    else if (item.visual_value === 5)
                                        return "#810102"
                                    else if (item.visual_value === 6)
                                        return "#008081"
                                    else if (item.visual_value === 7)
                                        return "#000000"
                                    else if (item.visual_value === 8)
                                        return "#808080"
                                    else
                                        return "black"
                                })()
                                ,
                                fontSize: cellSize / 2.5,
                                fontWeight: 'bold'
                            }]}

                        >
                            {
                                item.visual_value === 9 || item.visual_value === 10 ? "💣"
                                    : item.visual_value === -1 || item.visual_value === 0 ? ""
                                        : item.visual_value === 11 ? "🚩"
                                            : item.visual_value === 12 ? "❓"
                                                : item.visual_value?.toString()
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
    };

    return (
        <View style={{ flex: 1 }}>
            {/* 顶部 safe area 区域背景色 */}
            <View style={{ height: insets.top - 12, width: screenWidth, backgroundColor: (() => styles.noneClinetArea.color)() }} />

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
                    <View style={[styles.insetBox, { alignItems: 'center', width: '100%', backgroundColor: (() => styles.noneClinetArea.color)() }]}>
                        <Button
                            onPress={() => {
                                ViewModelA.regen()
                                setTimeout(() => {
                                    offsetX.value = 0;
                                    offsetY.value = 0;
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

                    </View>

                    <GestureHandlerRootView
                        style={
                            {
                                flex: 1,
                                overflow: "hidden",
                                backgroundColor: (() => styles.noneClinetArea.color2)()
                            }
                        }
                    >

                        <PinchGestureHandler onGestureEvent={pinchHandler} ref={pinchRef}  simultaneousHandlers={panRef}  enabled={pinchEnabled} >
                            <Animated.View >
                                <PanGestureHandler onGestureEvent={panHandler} ref={panRef} simultaneousHandlers={pinchRef} enabled={panEnabled}  >
                                    <Animated.View style={[animatedStyle, { width: actualWidth, height: actualHeight, borderWidth: 3, borderColor: "lightgray" }]}>
                                        <FlatList
                                            data={mines}
                                            bounces={false}
                                            overScrollMode="never"
                                            contentContainerStyle={[styles.flatlist]}
                                            renderItem={({ item, index }) => <RenderItem item={item} index={index} />}
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
                </View>
            </View>

            {/* 底部 safe area 区域背景色 */}
            {/* <View style={{ height: insets.bottom, backgroundColor: (()=> styles.noneClinetArea.color)() }} /> */}
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
        width: actualWidth,
        height: actualHeight

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
        fontSize: 16,
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