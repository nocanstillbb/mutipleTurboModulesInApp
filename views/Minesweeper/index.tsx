import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import { Button } from '@rneui/base';
import { FlatList, Text, View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    withDecay,
    withTiming,
} from 'react-native-reanimated';
import {
    PanGestureHandler,
    PinchGestureHandler,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';

import ViewModelA from '../../specs/NativeViewModelA';
import { LayoutChangeEvent } from 'react-native';



const numRows = 9;
const numColumns = 9;

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const cellSize = 100;
const actualHeight = cellSize * numRows;
const actualWidth = cellSize * numColumns;

var MIN_SCALE = 1;
const MAX_SCALE = 3;

export default function Minesweeper(): React.JSX.Element {

    const [obj, setObj] = useState(ViewModelA.getObj)
    const [mines, setMines] = useState(obj.sub_list.list)

    if (actualHeight > actualWidth) {
        MIN_SCALE = screenHeight / actualHeight;
    }
    else {
        MIN_SCALE = screenWidth / actualWidth;
    }

    const scale = useSharedValue(MIN_SCALE);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const xyHand = useSharedValue(0);

    const pinchRef = useRef(null);
    const panRef = useRef(null);

    const containerSize = useState({ width: 0, height: 0 })[0];
    const childSize = useState({ width: 0, height: 0 })[0];

    const hasCentered = useRef(false);

    const onContainerLayout = (e: LayoutChangeEvent) => {
        //if (hasCentered.current) return;
        containerSize.width = e.nativeEvent.layout.width;
        containerSize.height = e.nativeEvent.layout.height;
    };

    const insets = useSafeAreaInsets();
    const onChildLayout = (e: LayoutChangeEvent) => {
        if (hasCentered.current) return;
        hasCentered.current = true;
        childSize.width = e.nativeEvent.layout.width;
        childSize.height = e.nativeEvent.layout.height;
        offsetY.value = -insets.top ;
    };

    //useEffect(() => {
    //    const timeout = setTimeout(() => {
    //        offsetX.value = withTiming((containerSize.width - childSize.width) / 2);
    //        offsetY.value = withTiming((containerSize.height - childSize.height) / 2);
    //    }, 50);

    //    return () => clearTimeout(timeout);
    //}, []);





    const pinchHandler = useAnimatedGestureHandler<any>({
        onStart: (event, ctx: any) => {
            ctx.startScale = scale.value;
            ctx.startOffsetX = offsetX.value;
            ctx.startOffsetY = offsetY.value;
            ctx.focalX = event.focalX;
            ctx.focalY = event.focalY;
            xyHand.value = 0
        },
        onActive: (event, ctx: any) => {
            let newScale = ctx.startScale * event.scale;
            newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));

            const scaleDiff = newScale / ctx.startScale;
            const focalDeltaX =  event.focalX - ctx.focalX ;
            const focalDeltaY =  event.focalY - ctx.focalY ;

            // 正确的补偿公式
            offsetX.value = ctx.startOffsetX + focalDeltaX+ (scaleDiff - 1) * ((actualWidth / 2) - ctx.focalX  + ctx.startOffsetX);
            offsetY.value = ctx.startOffsetY + focalDeltaY+ (scaleDiff - 1) * ((actualHeight / 2) - ctx.focalY + ctx.startOffsetY);
            xyHand.value = 0

            scale.value = newScale;
        },
    })


    const panHandler = useAnimatedGestureHandler({
        onStart: (_, ctx: any) => {
            ctx.startX = offsetX.value;
            ctx.startY = offsetY.value;
            xyHand.value = 1
        },
        onActive: (event, ctx: any) => {
            if(xyHand.value!=0)
            {
                offsetX.value = ctx.startX + event.translationX;
                offsetY.value = ctx.startY + event.translationY;
            }
            xyHand.value = 1

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


    const renderItem = ({ item, index }: { item: typeof mines[0], index: number }) => {
        return (
            <View style={[{ width: cellSize, height: cellSize }, styles.item]}>
                <View style={[{
                    backgroundColor: "#e0e0e0",
                    position: "absolute",
                    top: (Math.floor(index / numColumns) === 0 ? 0 : 5),
                    left: (Math.floor(index % numColumns) === 0 ? 0 : 5),
                    right: 0,
                    bottom: 0,
                    flex: 1,
                    justifyContent: "center"
                }]} >
                    <TextInput
                        style={styles.text}
                        onChangeText={() => {
                            item.substr = item.substr + "1"
                        }}
                    />
                    <Button onPress={() => {
                    }} />
                </View>
            </View>
        );
    }

    return (
        <GestureHandlerRootView   onLayout={onContainerLayout} style={{ flex: 1, overflow: "hidden", backgroundColor: "pink" }}>
            {/* 双指缩放 */}
            <PinchGestureHandler onGestureEvent={pinchHandler} ref={pinchRef} >
                <Animated.View >
                    {/* 单指移动 */}
                    <PanGestureHandler onGestureEvent={panHandler} ref={panRef} simultaneousHandlers={pinchRef} >
                        <Animated.View onLayout={onChildLayout} style={[animatedStyle, { width: actualWidth, height: actualHeight, borderWidth: 3, borderColor: "black" }]}>
                            <FlatList
                                data={mines}
                                bounces={false}
                                overScrollMode="never"
                                contentContainerStyle={[styles.flatlist]}
                                renderItem={renderItem}
                                numColumns={numColumns}
                                keyExtractor={(item) => item.uuid}
                                scrollEnabled={false} // 禁止内建滚动，靠 pan 拖动
                            />
                        </Animated.View>
                    </PanGestureHandler>
                </Animated.View>
            </PinchGestureHandler>
        </GestureHandlerRootView>

    );
}

const styles = StyleSheet.create({
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
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        overflow: "hidden"
    },
    text: {
        fontSize: 16,
    },
});