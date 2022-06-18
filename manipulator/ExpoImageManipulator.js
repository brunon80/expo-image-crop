import React, { Component } from 'react'
import {
    Dimensions,
    Image,
    ScrollView,
    Modal,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    LogBox,
} from 'react-native'
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import PropTypes from 'prop-types'
import AutoHeightImage from 'react-native-auto-height-image'
import ImageCropOverlay from './ImageCropOverlay'
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window')

LogBox.ignoreLogs(['componentWillReceiveProps', 'componentWillUpdate', 'componentWillMount'])
LogBox.ignoreLogs([
    'Warning: componentWillMount is deprecated',
    'Warning: componentWillReceiveProps is deprecated',
    'Module RCTImageLoader requires',
])

class ExpoImageManipulator extends Component {
    constructor(props) {
        super(props)

        this.state = {
            cropMode: false,
            processing: false,
            zoomScale: 1,
            safeAreaHeight: 0,
            imageLayout: { x: 0, y: 0, width: 0, height: 0 },
            enableScroll: true,
            scrollOffsetY: 0
        }

        this.currentPos = {
            left: 0,
            top: 0,
        }

        this.currentSize = {
            width: 0,
            height: 0,
        }

        this.maxSizes = {
            width: 0,
            height: 0,
        }

        this.actualSize = {
            width: 0,
            height: 0,
        }
    }

    async componentDidMount() {
        await this.onConvertImageToEditableSize()
    }

    onGetCorrectSizes = (w, h) => {
        const sizes = {
            convertedWidth: w,
            convertedheight: h,
        }
        const ratio = Math.min(1920 / w, 1080 / h)
        sizes.convertedWidth = Math.round(w * ratio)
        sizes.convertedheight = Math.round(h * ratio)
        return sizes
    }

    async onConvertImageToEditableSize() {
        this.setState({uri: undefined})
        const { photo: { uri: rawUri }, saveOptions } = this.props
        Image.getSize(rawUri, async (imgW, imgH) => {
            const { convertedWidth, convertedheight } = this.onGetCorrectSizes(imgW, imgH)
            const { uri, width: w, height } = await ImageManipulator.manipulateAsync(rawUri,
                [
                    {
                        resize: {
                            width: convertedWidth,
                            height: convertedheight,
                        },
                    },
                ], saveOptions)
            this.setState({
                uri,
                screenTop: 0
            })
            this.actualSize.width = w
            this.actualSize.height = height
        })
    }

    get isRemote() {
        const { uri } = this.state
        return /^(http|https|ftp)?(?:[:/]*)([a-z0-9.-]*)(?::([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/.test(uri)
    }

    onToggleModal = () => {
        const { onToggleModal } = this.props
        onToggleModal()
        this.setState({ cropMode: false })
    }

    onCropImage = () => {
        this.setState({ processing: true })
        const { uri } = this.state
        Image.getSize(uri, async (actualWidth, actualHeight) => {
            const cropObj = this.getCropBounds(actualWidth, actualHeight)
            if (cropObj.height > 0 && cropObj.width > 0) {
                let uriToCrop = uri
                if (this.isRemote) {
                    const response = await FileSystem.downloadAsync(
                        uri,
                        FileSystem.documentDirectory + 'image',
                    )
                    uriToCrop = response.uri
                }
                const {
                    uri: uriCroped, base64, width: croppedWidth, height: croppedHeight,
                } = await this.crop(cropObj, uriToCrop)

                this.actualSize.width = croppedWidth
                this.actualSize.height = croppedHeight

                this.setState({
                    uri: uriCroped, base64, cropMode: false, processing: false,
                })
            } else {
                this.setState({ cropMode: false, processing: false })
            }
        })
    }

    onRotateImage = async () => {
        const { uri } = this.state
        let uriToCrop = uri
        if (this.isRemote) {
            const response = await FileSystem.downloadAsync(
                uri,
                FileSystem.documentDirectory + 'image',
            )
            uriToCrop = response.uri
        }
        Image.getSize(uri, async (width2, height2) => {
            const { uri: rotUri, base64 } = await this.rotate(uriToCrop, width2, height2)
            this.setState({ uri: rotUri, base64 })
        })
    }

    onFlipImage = async (orientation) => {
        const { uri } = this.state
        let uriToCrop = uri
        if (this.isRemote) {
            const response = await FileSystem.downloadAsync(
                uri,
                FileSystem.documentDirectory + 'image',
            )
            uriToCrop = response.uri
        }
        Image.getSize(uri, async () => {
            const { uri: rotUri, base64 } = await this.filp(uriToCrop, orientation)
            this.setState({ uri: rotUri, base64 })
        })
    }

    getCropBounds = (actualWidth, actualHeight) => {
        const imageRatio = actualHeight / actualWidth
        const renderedImageWidth = screenWidth
        const renderedImageHeight = screenWidth * imageRatio

        const widthRatio = actualWidth / renderedImageWidth
        const heightRatio = actualHeight / renderedImageHeight

        return {
            originX: this.currentPos.left * widthRatio,
            originY: this.currentPos.top * heightRatio,
            width: this.currentSize.width * widthRatio,
            height: this.currentSize.height * heightRatio,
        }
    }

    filp = async (uri, orientation) => {
        const { saveOptions } = this.props
        const manipResult = await ImageManipulator.manipulateAsync(uri, [{
            flip: orientation === 'vertical' ? ImageManipulator.FlipType.Vertical : ImageManipulator.FlipType.Horizontal,
        }],
        saveOptions)
        return manipResult
    };

    rotate = async (uri, width2) => {
        const { saveOptions } = this.props
        const manipResult = await ImageManipulator.manipulateAsync(uri, [{
            rotate: -90,
        }, {
            resize: {
                width: this.trueWidth || width2,
                // height: this.trueHeight || height2,
            },
        }], saveOptions)
        return manipResult
    }

    crop = async (cropObj, uri) => {
        const { saveOptions } = this.props
        if (cropObj.height > 0 && cropObj.width > 0) {
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{
                    crop: cropObj,
                }],
                saveOptions,
            )
            return manipResult
        }
        return {
            uri: null,
            base64: null,
        }
    };

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
    async UNSAFE_componentWillReceiveProps() {
        await this.onConvertImageToEditableSize()
    }

    zoomImage() {
        // this.refs.imageScrollView.zoomScale = 5
        // this.setState({width: screenWidth})
        // this.setState({zoomScale: 5})

        // this.setState(curHeight)
    }

    getIconFromProps(name, defaultNode){
        if(this.props.icons && this.props.icons[name]){
            return this.props.icons[name]
        }

        return defaultNode
    }

    render() {
        const {
            isVisible,
            onPictureChoosed,
            borderColor,
            allowRotate = true,
            allowFlip = true,
            btnTexts,
            fixedMask,
            ratio,
        } = this.props
        const {
            uri,
            base64,
            cropMode,
            processing,
        } = this.state

        const imageRatio = this.actualSize.height / this.actualSize.width
        const screenHeight = Dimensions.get('window').height - this.state.safeAreaHeight

        const screenRatio = screenHeight / screenWidth

        let cropWidth = screenWidth
        let cropHeight = imageRatio < screenRatio ? screenWidth * imageRatio : screenHeight - 200

        let cropMinWidth = 60
        let cropMinHeight = 60

        if(ratio && ratio.width && ratio.height){
            const cropRatio = ratio.height / ratio.width;
            if(cropRatio > imageRatio){
                cropWidth = cropHeight / cropRatio
            } else {
                cropHeight = cropWidth * cropRatio
            }

            if(cropRatio < 1){
                cropMinWidth = cropMinHeight / cropRatio
            } else {
                cropMinHeight = cropMinWidth * cropRatio
            }
        }

        const cropInitialTop = ((Math.min(this.state.imageLayout.height, screenHeight) - cropHeight) / 2.0) + this.state.scrollOffsetY
        const cropInitialLeft = (screenWidth - cropWidth) / 2.0


        if (this.currentSize.width === 0 && cropMode) {
            this.currentSize.width = cropWidth
            this.currentSize.height = cropHeight

            this.currentPos.top = cropInitialTop
            this.currentPos.left = cropInitialLeft
        }
        return (
            <Modal
                animationType="slide"
                transparent
                visible={isVisible}
                hardwareAccelerated
                onRequestClose={() => {
                    this.onToggleModal()
                }}
            >
                <SafeAreaView
                    style={{
                        width: screenWidth, flexDirection: 'row', backgroundColor: 'black', justifyContent: 'space-between',
                    }}
                    onLayout={e => this.setState({safeAreaHeight: e.nativeEvent.layout.height})}
                >
                    <ScrollView scrollEnabled={false}
                        horizontal
                        contentContainerStyle={{
                            width: '100%', paddingHorizontal: 15, height: 44, alignItems: 'center',
                        }}
                    >
                        {!cropMode
                            ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => this.onToggleModal()}
                                        style={{
                                            width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        {this.getIconFromProps('back', (
                                            <MaterialIcons size={24} name="arrow-back-ios" color="white" />
                                        ))}
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <TouchableOpacity onPress={() => this.setState({ cropMode: true })}
                                            style={{
                                                marginLeft: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            <MaterialCommunityIcons size={20} name="crop" color="white" />
                                        </TouchableOpacity>
                                        {
                                            allowRotate
                                            && (
                                                <View style={{ flexDirection: 'row' }}>

                                                    <TouchableOpacity onPress={() => this.onRotateImage()}
                                                        style={{
                                                            marginLeft: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                                                        }}
                                                    >
                                                        <MaterialCommunityIcons size={20} name="rotate-left" color="white" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => this.onFlipImage('vertical')}
                                                        style={{
                                                            marginLeft: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                                                        }}
                                                    >
                                                        <MaterialIcons style={{ transform: [{ rotate: '270deg' }] }} size={20} name="flip" color="white" />
                                                    </TouchableOpacity>
                                                </View>
                                            )
                                        }
                                        {
                                            allowFlip
                                            && (
                                                <View style={{ flexDirection: 'row' }}>

                                                    <TouchableOpacity onPress={() => this.onFlipImage('horizontal')}
                                                        style={{
                                                            marginLeft: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                                                        }}
                                                    >
                                                        <MaterialIcons size={20} name="flip" color="white" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => { onPictureChoosed({ uri, base64 }); this.onToggleModal() }}
                                                        style={{
                                                            marginLeft: 10, width: 60, height: 32, alignItems: 'center', justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Text style={{ fontWeight: '500', color: 'white', fontSize: 18 }}>{btnTexts.done}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )
                                        }
                                    </View>
                                </View>
                            )
                            : (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => this.setState({ cropMode: false })}
                                        style={{
                                            width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        {this.getIconFromProps('back', (
                                            <MaterialIcons size={24} name="arrow-back-ios" color="white" />
                                        ))}
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.onCropImage()}
                                        style={{
                                            marginRight: 10, alignItems: 'flex-end', flex: 1,
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            {processing ?
                                                this.getIconFromProps('processing', (
                                                    <MaterialIcons style={{ marginRight: 5 }} size={20} name={'access-time'} color="white" />
                                                ))
                                                :
                                                this.getIconFromProps('crop', (
                                                    <FontAwesome style={{ marginRight: 5 }} size={20} name={'scissors'} color="white" />
                                                ))
                                            }
                                            <Text style={{ fontWeight: '500', color: 'white', fontSize: 18 }}>{!processing ? btnTexts.crop : btnTexts.processing}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    </ScrollView>
                </SafeAreaView>
                <View style={{ flex: 1, backgroundColor: 'black', width: Dimensions.get('window').width }}>
                    <ScrollView
                        style={{ position: 'relative', flex: 1 }}
                        contentContainerStyle={{ backgroundColor: 'black', justifyContent: 'center' }}
                        bounces={false}
                        scrollEnabled={this.state.enableScroll}
                        onScrollEndDrag={e => this.setState({scrollOffsetY: e.nativeEvent.contentOffset.y})}
                    >
                        <AutoHeightImage
                            source={{ uri }}
                            resizeMode={'contain'}
                            width={screenWidth}
                            onLayout={e => this.setState({imageLayout: e.nativeEvent.layout})}
                        />
                        {!!cropMode && (
                            <ImageCropOverlay
                                onStartLayoutChange={() => this.setState({enableScroll: false})}
                                onLayoutChanged={(top, left, w, height) => {
                                    this.currentSize.width = w
                                    this.currentSize.height = height
                                    this.currentPos.top = top
                                    this.currentPos.left = left
                                    this.setState({enableScroll: true})
                                }}
                                initialWidth={(fixedMask && fixedMask.width) || cropWidth}
                                initialHeight={(fixedMask && fixedMask.height) || cropHeight}
                                initialTop={cropInitialTop}
                                initialLeft={cropInitialLeft}
                                minWidth={(fixedMask && fixedMask.width) || cropMinWidth}
                                minHeight={(fixedMask && fixedMask.height) || cropMinHeight}
                                borderColor={borderColor}
                                ratio={ratio || {ratio: {height: null, width: null, }}}
                                safeAreaHeight={this.state.safeAreaHeight}
                                imageLayout={this.state.imageLayout}
                                scrollOffsetY={this.state.scrollOffsetY}
                            />
                        )
                        }
                    </ScrollView>
                </View>
            </Modal>
        )
    }
}

export default ExpoImageManipulator

ExpoImageManipulator.defaultProps = {
    onPictureChoosed: ({ uri, base64 }) => console.log('URI:', uri, base64),
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
    fixedMask: null,
}

ExpoImageManipulator.propTypes = {
    borderColor: PropTypes.string,
    isVisible: PropTypes.bool.isRequired,
    onPictureChoosed: PropTypes.func,
    btnTexts: PropTypes.object,
    fixedMask: PropTypes.object,
    saveOptions: PropTypes.object,
    photo: PropTypes.object.isRequired,
    onToggleModal: PropTypes.func.isRequired,
    ratio: PropTypes.object,
    icons: PropTypes.object
}
