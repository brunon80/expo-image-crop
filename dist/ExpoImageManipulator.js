var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { Component } from 'react';
import { Dimensions, Image, ScrollView, Modal, View, Text, SafeAreaView, TouchableOpacity, LogBox, } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import AutoHeightImage from 'react-native-auto-height-image';
import ImageCropOverlay from './ImageCropOverlay';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
const { width: screenWidth } = Dimensions.get('window');
LogBox.ignoreLogs(['componentWillReceiveProps', 'componentWillUpdate', 'componentWillMount']);
LogBox.ignoreLogs([
    'Warning: componentWillMount is deprecated',
    'Warning: componentWillReceiveProps is deprecated',
    'Module RCTImageLoader requires',
]);
class ExpoImageManipulator extends Component {
    constructor(props) {
        super(props);
        this.onGetCorrectSizes = (w, h) => {
            const sizes = {
                convertedWidth: w,
                convertedheight: h,
            };
            const ratio = Math.min(1920 / w, 1080 / h);
            sizes.convertedWidth = Math.round(w * ratio);
            sizes.convertedheight = Math.round(h * ratio);
            return sizes;
        };
        this.onToggleModal = () => {
            const { onToggleModal } = this.props;
            onToggleModal();
            this.setState({ cropMode: false });
        };
        this.onCropImage = () => {
            this.setState({ processing: true });
            const { uri } = this.state;
            if (!uri) {
                return;
            }
            Image.getSize(uri, (actualWidth, actualHeight) => __awaiter(this, void 0, void 0, function* () {
                const cropObj = this.getCropBounds(actualWidth, actualHeight);
                if (cropObj.height > 0 && cropObj.width > 0) {
                    let uriToCrop = uri;
                    if (this.isRemote) {
                        const response = yield FileSystem.downloadAsync(uri, FileSystem.documentDirectory + 'image');
                        uriToCrop = response.uri;
                    }
                    const { uri: uriCroped, base64, width: croppedWidth, height: croppedHeight, } = yield this.crop(cropObj, uriToCrop);
                    this.actualSize.width = croppedWidth;
                    this.actualSize.height = croppedHeight;
                    this.setState({
                        uri: uriCroped, base64, cropMode: false, processing: false,
                    });
                }
                else {
                    this.setState({ cropMode: false, processing: false });
                }
            }));
        };
        this.onRotateImage = () => __awaiter(this, void 0, void 0, function* () {
            const { uri } = this.state;
            if (!uri) {
                return;
            }
            let uriToCrop = uri;
            if (this.isRemote) {
                const response = yield FileSystem.downloadAsync(uri, FileSystem.documentDirectory + 'image');
                uriToCrop = response.uri;
            }
            Image.getSize(uri, (width, _height) => __awaiter(this, void 0, void 0, function* () {
                const { uri: rotUri, base64 } = yield this.rotate(uriToCrop, width);
                this.setState({ uri: rotUri, base64 });
            }));
        });
        this.onFlipImage = (orientation) => __awaiter(this, void 0, void 0, function* () {
            const { uri } = this.state;
            if (!uri) {
                return;
            }
            let uriToCrop = uri;
            if (this.isRemote) {
                const response = yield FileSystem.downloadAsync(uri, FileSystem.documentDirectory + 'image');
                uriToCrop = response.uri;
            }
            Image.getSize(uri, () => __awaiter(this, void 0, void 0, function* () {
                const { uri: rotUri, base64 } = yield this.filp(uriToCrop, orientation);
                this.setState({ uri: rotUri, base64 });
            }));
        });
        this.getCropBounds = (actualWidth, actualHeight) => {
            const imageRatio = actualHeight / actualWidth;
            const renderedImageWidth = screenWidth;
            const renderedImageHeight = screenWidth * imageRatio;
            const widthRatio = actualWidth / renderedImageWidth;
            const heightRatio = actualHeight / renderedImageHeight;
            return {
                originX: this.currentPos.left * widthRatio,
                originY: this.currentPos.top * heightRatio,
                width: this.currentSize.width * widthRatio,
                height: this.currentSize.height * heightRatio,
            };
        };
        this.filp = (uri, orientation) => __awaiter(this, void 0, void 0, function* () {
            const { saveOptions } = this.props;
            const manipResult = yield ImageManipulator.manipulateAsync(uri, [{
                    flip: orientation,
                }], saveOptions);
            return manipResult;
        });
        this.rotate = (uri, width) => __awaiter(this, void 0, void 0, function* () {
            const { saveOptions } = this.props;
            return yield ImageManipulator.manipulateAsync(uri, [{ rotate: -90 }, { resize: { width: width } }], saveOptions);
        });
        this.crop = (cropObj, uri) => __awaiter(this, void 0, void 0, function* () {
            const { saveOptions } = this.props;
            if (cropObj.height > 0 && cropObj.width > 0) {
                const manipResult = yield ImageManipulator.manipulateAsync(uri, [{
                        crop: cropObj,
                    }], saveOptions);
                return manipResult;
            }
            return {
                uri: uri,
                base64: undefined,
                width: 0,
                height: 0
            };
        });
        this.state = {
            uri: undefined,
            base64: undefined,
            cropMode: false,
            processing: false,
            zoomScale: 1,
            safeAreaHeight: 0,
            imageLayout: { x: 0, y: 0, width: 0, height: 0 },
            enableScroll: true,
            scrollOffsetY: 0
        };
        this.currentPos = {
            left: 0,
            top: 0,
        };
        this.currentSize = {
            width: 0,
            height: 0,
        };
        this.maxSizes = {
            width: 0,
            height: 0,
        };
        this.actualSize = {
            width: 0,
            height: 0,
        };
    }
    componentDidMount() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.onConvertImageToEditableSize();
        });
    }
    onConvertImageToEditableSize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setState({ uri: undefined });
            const { photo: { uri: rawUri }, saveOptions } = this.props;
            Image.getSize(rawUri, (imgW, imgH) => __awaiter(this, void 0, void 0, function* () {
                const { convertedWidth, convertedheight } = this.onGetCorrectSizes(imgW, imgH);
                const { uri, width: w, height } = yield ImageManipulator.manipulateAsync(rawUri, [
                    {
                        resize: {
                            width: convertedWidth,
                            height: convertedheight,
                        },
                    },
                ], saveOptions);
                this.setState({ uri });
                this.actualSize.width = w;
                this.actualSize.height = height;
            }));
        });
    }
    get isRemote() {
        const { uri } = this.state;
        if (!uri) {
            throw new Error('state.uri is still undefined.');
        }
        return /^(http|https|ftp)?(?:[:/]*)([a-z0-9.-]*)(?::([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/.test(uri);
    }
    // calculateMaxSizes = (event) => {
    //     const { fixedSquareAspect } = this.state
    //     let w1 = event.nativeEvent.layout.width || 100
    //     let h1 = event.nativeEvent.layout.height || 100
    //     if (fixedSquareAspect) {
    //         if (w1 < h1) h1 = w1
    //         else w1 = h1
    //     }
    //     this.maxSizes.width = w1
    //     this.maxSizes.height = h1
    // };
    // eslint-disable-next-line camelcase
    UNSAFE_componentWillReceiveProps() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.onConvertImageToEditableSize();
        });
    }
    zoomImage() {
        // this.refs.imageScrollView.zoomScale = 5
        // this.setState({width: screenWidth})
        // this.setState({zoomScale: 5})
        // this.setState(curHeight)
    }
    getIconFromProps(name, defaultNode) {
        if (this.props.icons && this.props.icons[name]) {
            return this.props.icons[name];
        }
        return defaultNode;
    }
    render() {
        const { isVisible, onPictureChoosed, borderColor, allowRotate = true, allowFlip = true, btnTexts, fixedMask, ratio, } = this.props;
        const { uri, base64, cropMode, processing, } = this.state;
        const imageRatio = this.actualSize.height / this.actualSize.width;
        const screenHeight = Dimensions.get('window').height - this.state.safeAreaHeight;
        const screenRatio = screenHeight / screenWidth;
        let cropWidth = screenWidth;
        let cropHeight = imageRatio < screenRatio ? screenWidth * imageRatio : screenHeight - 200;
        let cropMinWidth = 60;
        let cropMinHeight = 60;
        if (ratio && ratio.width && ratio.height) {
            const cropRatio = ratio.height / ratio.width;
            if (cropRatio > imageRatio) {
                cropWidth = cropHeight / cropRatio;
            }
            else {
                cropHeight = cropWidth * cropRatio;
            }
            if (cropRatio < 1) {
                cropMinWidth = cropMinHeight / cropRatio;
            }
            else {
                cropMinHeight = cropMinWidth * cropRatio;
            }
        }
        const cropInitialTop = ((Math.min(this.state.imageLayout.height, screenHeight) - cropHeight) / 2.0) + this.state.scrollOffsetY;
        const cropInitialLeft = (screenWidth - cropWidth) / 2.0;
        if (this.currentSize.width === 0 && cropMode) {
            this.currentSize.width = cropWidth;
            this.currentSize.height = cropHeight;
            this.currentPos.top = cropInitialTop;
            this.currentPos.left = cropInitialLeft;
        }
        return (React.createElement(Modal, { animationType: "slide", transparent: true, visible: isVisible, hardwareAccelerated: true, onRequestClose: () => {
                this.onToggleModal();
            } },
            React.createElement(SafeAreaView, { style: {
                    width: screenWidth, flexDirection: 'row', backgroundColor: 'black', justifyContent: 'space-between',
                }, onLayout: e => this.setState({ safeAreaHeight: e.nativeEvent.layout.height }) },
                React.createElement(ScrollView, { scrollEnabled: false, horizontal: true, contentContainerStyle: {
                        width: '100%', paddingHorizontal: 15, height: 44, alignItems: 'center',
                    } }, !cropMode
                    ? (React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center' } },
                        React.createElement(TouchableOpacity, { onPress: () => this.onToggleModal(), style: {
                                width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                            } }, this.getIconFromProps('back', (React.createElement(MaterialIcons, { size: 24, name: "arrow-back-ios", color: "white" })))),
                        React.createElement(View, { style: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' } },
                            React.createElement(TouchableOpacity, { onPress: () => this.setState({ cropMode: true }), style: {
                                    marginLeft: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                                } },
                                React.createElement(MaterialCommunityIcons, { size: 20, name: "crop", color: "white" })),
                            allowRotate
                                && (React.createElement(View, { style: { flexDirection: 'row' } },
                                    React.createElement(TouchableOpacity, { onPress: () => this.onRotateImage(), style: {
                                            marginLeft: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                                        } },
                                        React.createElement(MaterialCommunityIcons, { size: 20, name: "rotate-left", color: "white" })),
                                    React.createElement(TouchableOpacity, { onPress: () => this.onFlipImage(ImageManipulator.FlipType.Vertical), style: {
                                            marginLeft: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                                        } },
                                        React.createElement(MaterialIcons, { style: { transform: [{ rotate: '270deg' }] }, size: 20, name: "flip", color: "white" })))),
                            allowFlip
                                && (React.createElement(View, { style: { flexDirection: 'row' } },
                                    React.createElement(TouchableOpacity, { onPress: () => this.onFlipImage(ImageManipulator.FlipType.Horizontal), style: {
                                            marginLeft: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                                        } },
                                        React.createElement(MaterialIcons, { size: 20, name: "flip", color: "white" })),
                                    React.createElement(TouchableOpacity, { onPress: () => {
                                            if (uri) {
                                                onPictureChoosed({ uri, base64 });
                                                this.onToggleModal();
                                            }
                                        }, style: {
                                            marginLeft: 10, width: 60, height: 32, alignItems: 'center', justifyContent: 'center',
                                        } },
                                        React.createElement(Text, { style: { fontWeight: '500', color: 'white', fontSize: 18 } }, btnTexts.done)))))))
                    : (React.createElement(View, { style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } },
                        React.createElement(TouchableOpacity, { onPress: () => this.setState({ cropMode: false }), style: {
                                width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                            } }, this.getIconFromProps('back', (React.createElement(MaterialIcons, { size: 24, name: "arrow-back-ios", color: "white" })))),
                        React.createElement(TouchableOpacity, { onPress: () => this.onCropImage(), style: {
                                marginRight: 10, alignItems: 'flex-end', flex: 1,
                            } },
                            React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center' } },
                                processing ?
                                    this.getIconFromProps('processing', (React.createElement(MaterialIcons, { style: { marginRight: 5 }, size: 20, name: 'access-time', color: "white" })))
                                    :
                                        this.getIconFromProps('crop', (React.createElement(FontAwesome, { style: { marginRight: 5 }, size: 20, name: 'scissors', color: "white" }))),
                                React.createElement(Text, { style: { fontWeight: '500', color: 'white', fontSize: 18 } }, !processing ? btnTexts.crop : btnTexts.processing))))))),
            React.createElement(View, { style: { flex: 1, backgroundColor: 'black', width: Dimensions.get('window').width } },
                React.createElement(ScrollView, { style: { position: 'relative', flex: 1 }, contentContainerStyle: { backgroundColor: 'black', justifyContent: 'center' }, bounces: false, scrollEnabled: this.state.enableScroll, onScrollEndDrag: e => this.setState({ scrollOffsetY: e.nativeEvent.contentOffset.y }) },
                    uri &&
                        React.createElement(AutoHeightImage, { source: { uri }, resizeMode: 'contain', width: screenWidth, onLayout: e => {
                                console.log('onlayout', e.nativeEvent.layout);
                                this.setState({ imageLayout: e.nativeEvent.layout });
                            } }),
                    !!cropMode && (React.createElement(ImageCropOverlay, { onStartLayoutChange: () => this.setState({ enableScroll: false }), onLayoutChanged: (top, left, width, height) => {
                            this.currentSize.width = width;
                            this.currentSize.height = height;
                            this.currentPos.top = top;
                            this.currentPos.left = left;
                            this.setState({ enableScroll: true });
                        }, initialWidth: (fixedMask && fixedMask.width) || cropWidth, initialHeight: (fixedMask && fixedMask.height) || cropHeight, initialTop: cropInitialTop, initialLeft: cropInitialLeft, minWidth: (fixedMask && fixedMask.width) || cropMinWidth, minHeight: (fixedMask && fixedMask.height) || cropMinHeight, borderColor: borderColor, ratio: ratio || undefined, safeAreaHeight: this.state.safeAreaHeight, imageLayout: this.state.imageLayout, scrollOffsetY: this.state.scrollOffsetY }))))));
    }
}
ExpoImageManipulator.defaultProps = {
    borderColor: '#a4a4a4',
    btnTexts: {
        crop: 'Crop',
        rotate: 'Rotate',
        done: 'Done',
        processing: 'Processing',
    },
    saveOptions: {
        compress: 1,
        format: ImageManipulator.SaveFormat.PNG,
        base64: false,
    },
    fixedMask: undefined,
};
export default ExpoImageManipulator;
