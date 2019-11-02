import React, { Component } from 'react'
import {
    PanResponder,
    Dimensions,
    Image,
    ScrollView,
    Modal,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native'
import * as Animatable from 'react-native-animatable'
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import PropTypes from 'prop-types'
import AutoHeightImage from 'react-native-auto-height-image'
// eslint-disable-next-line import/no-extraneous-dependencies
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
// eslint-enable-next-line import/no-extraneous-dependencies

import HybridTouch from '../HybridTouch'

const { width } = Dimensions.get('window')

class ImgManipulator extends Component {
    constructor(props) {
        super(props)
        const { photo, squareAspect } = this.props
        this.state = {
            cropMode: false,
            processing: false,
            uri: photo.uri,
            squareAspect,
        }

        this.scrollOffset = 0

        this.trueSize = {}
        if (photo.width || photo.height) {
            if (photo.width) {
                this.trueSize.width = photo.width
            }
            if (photo.height) {
                this.trueSize.height = photo.height
            }
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

        this.isResizing = false

        this._panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: () => false,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            onPanResponderGrant: this.onGrant,
            onPanResponderMove: this.onMove,
            onPanResponderTerminationRequest: () => true,
            onPanResponderRelease: this.onRelease,
            onPanResponderTerminate: () => {
                // Another component has become the responder, so this gesture
                // should be cancelled
            },
            onShouldBlockNativeResponder: () => false,
        })
    }

    get trueWidth() {
        return this.trueSize && this.trueSize.width ? this.trueSize.width : null
    }
    get trueHeight() {
        return this.trueSize && this.trueSize.height ? this.trueSize.height : null
    }

    get isRemote() {
        const { uri } = this.state
        return /^(http|https|ftp)?(?:[:/]*)([a-z0-9.-]*)(?::([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/.test(uri)
    }

    onGrant = () => {
        this.scrollView.setNativeProps({ scrollEnabled: false })
    }

    onMove = (evt, gestureState) => {
        const { dragVelocity, resizeVelocity } = this.props
        const { squareAspect } = this.state
        const corner = this.corner
        const { vx, vy } = gestureState
        if (!this.isResizing && !corner) {
            const xVel = vx * dragVelocity
            const yVel = vy * dragVelocity
            this.square.transitionTo(
                {
                    left: this.currentPos.left + xVel,
                    top: this.currentPos.top + yVel,
                },
                0,
            )
        } else {
            this.isResizing = true
            const xVelAbs = Math.abs(vx)
            const yVelAbs = Math.abs(vy)
            const vel = (xVelAbs > yVelAbs ? vx : vy) * resizeVelocity
            const xVel = vx * resizeVelocity
            const yVel = vy * resizeVelocity
            // tl - positive move - move top left coordinates and shrink size
            const upDown = yVelAbs > xVelAbs
            let xChange; let
                yChange
            if (corner === 'tl') {
                xChange = squareAspect ? -vel : -xVel
                yChange = squareAspect ? xChange : yVel

                const squareWidth = this.currentSize.width + xChange

                const squareHeight = squareAspect
                    ? squareWidth
                    : this.currentSize.height + -yChange

                const topMove = squareAspect
                    ? upDown
                        ? vel
                        : vel
                    : upDown
                        ? yChange
                        : yChange

                const leftMove = squareAspect
                    ? upDown
                        ? -vel
                        : -vel
                    : upDown
                        ? xChange
                        : xChange

                this.square.transitionTo(
                    {
                        top: this.currentPos.top + topMove,
                        left: this.currentPos.left + -leftMove,
                        width: squareWidth < 100 ? 100 : squareWidth,
                        height: squareHeight < 100 ? 100 : squareHeight,
                    },
                    0,
                )
            } else if (corner === 'tr') {
                xChange = squareAspect ? (upDown ? -vel : vel) : xVel
                yChange = squareAspect ? xChange : yVel

                const squareWidth = this.currentSize.width + xChange

                const squareHeight = squareAspect
                    ? squareWidth
                    : this.currentSize.height + -yChange

                const topMove = squareAspect
                    ? upDown
                        ? vel
                        : -vel
                    : upDown
                        ? yChange
                        : -yChange

                this.square.transitionTo(
                    {
                        top: this.currentPos.top + topMove,
                        width: squareWidth < 100 ? 100 : squareWidth,
                        height: squareHeight < 100 ? 100 : squareHeight,
                    },
                    0,
                )
            } else if (corner === 'bl') {
                xChange = squareAspect ? (upDown ? -vel : vel) : xVel
                yChange = squareAspect ? xChange : yVel

                const squareWidth = this.currentSize.width + -xChange

                const squareHeight = squareAspect
                    ? squareWidth
                    : this.currentSize.height + yChange

                const leftMove = squareAspect
                    ? upDown
                        ? -vel
                        : vel
                    : upDown
                        ? -xChange
                        : xChange

                this.square.transitionTo(
                    {
                        left: this.currentPos.left + leftMove,
                        width: squareWidth < 100 ? 100 : squareWidth,
                        height: squareHeight < 100 ? 100 : squareHeight,
                    },
                    0,
                )
            } else if (corner === 'br') {
                xChange = squareAspect ? vel : xVel
                yChange = squareAspect ? xChange : yVel

                const squareWidth = this.currentSize.width + xChange

                const squareHeight = squareAspect
                    ? squareWidth
                    : this.currentSize.height + yChange

                this.square.transitionTo(
                    {
                        width: squareWidth < 100 ? 100 : squareWidth,
                        height: squareHeight < 100 ? 100 : squareHeight,
                    },
                    0,
                )
            }
            // tl - negative move - move top left coordinates and increase size
            // tr - move top right coordinates and shrink size
        }
    }

    onRelease = () => {
        this.scrollView.setNativeProps({ scrollEnabled: true })
        this.isResizing = false
        this.corner = null
    }

    onToggleModal = () => {
        const { onToggleModal } = this.props
        onToggleModal()
        this.setState({ cropMode: false })
    }

    onCropImage = () => {
        this.setState({ processing: true })
        let imgWidth
        let imgHeight
        const { uri } = this.state
        Image.getSize(uri, async (width2, height2) => {
            let cropObj;
            ({ cropObj, imgWidth, imgHeight } = this.getCropBounds(imgWidth, width2, imgHeight, height2))

            if (cropObj.height > 0 && cropObj.width > 0) {
                let uriToCrop = uri
                if (this.isRemote) {
                    const response = await FileSystem.downloadAsync(
                        uri,
                        FileSystem.documentDirectory + 'image',
                    )
                    uriToCrop = response.uri
                }
                const uriCroped = await this.crop(cropObj, uriToCrop)
                this.setState({ uri: uriCroped, cropMode: false, processing: false })
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
            const rotUri = await this.rotate(uriToCrop, width2, height2)
            this.setState({ uri: rotUri })
        })
    }

    onHandleScroll = (event) => {
        this.scrollOffset = event.nativeEvent.contentOffset.y
    }

    getCropBounds = (imgWidth, width2, imgHeight, height2) => {
        imgWidth = this.trueWidth || width2
        imgHeight = this.trueHeight || height2
        const heightRatio = this.currentSize.height / this.maxSizes.height
        const offsetHeightRatio = this.currentPos.top / this.maxSizes.height
        const isOutOfBoundsY = imgHeight < (imgHeight * heightRatio) + imgHeight * offsetHeightRatio
        const offsetMaxHeight = (imgHeight * heightRatio + imgHeight * offsetHeightRatio) - imgHeight
        const isOutOfBoundsX = imgWidth < (this.currentPos.left * imgWidth / width) + (this.currentSize.width * imgWidth / width)
        const offsetMaxWidth = (this.currentPos.left * imgWidth / width) + (this.currentSize.width * imgWidth / width) - imgWidth
        const isOutOfBoundsLeft = (this.currentPos.left * imgWidth / width) < 0
        const isOutOfBoundsTop = (imgHeight * offsetHeightRatio) < 0
        const originX = isOutOfBoundsLeft ? 0 : this.currentPos.left * imgWidth / width
        const originY = isOutOfBoundsTop ? 0 : imgHeight * offsetHeightRatio
        let cropWidth = this.currentSize.width * imgWidth / width
        let cropHeight = imgHeight * heightRatio
        if (isOutOfBoundsX) {
            cropWidth -= offsetMaxWidth
        }
        if (isOutOfBoundsY) {
            cropHeight -= offsetMaxHeight
        }
        if (isOutOfBoundsLeft) {
            cropWidth += this.currentPos.left * imgWidth / width
        }
        if (isOutOfBoundsTop) {
            cropHeight += imgHeight * offsetHeightRatio
        }
        const cropObj = {
            originX,
            originY,
            width: cropWidth,
            height: cropHeight,
        }
        return { cropObj, imgWidth, imgHeight }
    }

    rotate = async (uri, width2, height2) => {
        const manipResult = await ImageManipulator.manipulateAsync(uri, [{
            rotate: -90,
        }, {
            resize: {
                width: this.trueWidth || width2,
                height: this.trueHeight || height2,
            },
        }], {
            compress: 1,
        })
        return manipResult.uri
    }

    crop = async (cropObj, uri) => {
        if (cropObj.height > 0 && cropObj.width > 0) {
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{
                    crop: cropObj,
                }],
                { format: 'png' },
            )
            return manipResult.uri
        }
        return ''
    };

    calculateMaxSizes = (event) => {
        let w1 = event.nativeEvent.layout.width || 100
        let h1 = event.nativeEvent.layout.height || 100
        if (this.state.squareAspect) {
            if (w1 < h1) h1 = w1
            else w1 = h1
        }
        this.maxSizes.width = w1
        this.maxSizes.height = h1
    };

    renderButtom = (title, action, icon) => (
        <HybridTouch onPress={action}>
            <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}>
                <Icon size={20} name={icon} color="white" />
                <Text style={{ color: 'white', fontSize: 15, marginLeft: 5 }}>{title}</Text>
            </View>
        </HybridTouch>
    )

    setCorner = (corner) => {
        this.corner = corner
    };

    onShouldMove = () => {
        this.isResizing = true
        this.corner = null
    }

    render() {
        const {
            isVisible,
            onPictureChoosed,
            borderColor = '#a4a4a4',
            allowRotate = true,
            pinchGestureEnabled,
            btnTexts,
        } = this.props
        const {
            uri,
            cropMode,
            processing,
        } = this.state
        return (
            <Modal
                animationType="slide"
                transparent={false}
                visible={isVisible}
                hardwareAccelerated
                onRequestClose={() => {
                    this.onToggleModal()
                    console.log('Modal has been closed.')
                }}
            >
                <SafeAreaView
                    style={{
                        width, backgroundColor: 'black', flexDirection: 'row', justifyContent: 'space-between',
                    }}
                >
                    <ScrollView horizontal>
                        {this.renderButtom('', this.onToggleModal, 'arrow-left')}
                        {
                            !cropMode
                                ? (
                                    <View style={{ flexDirection: 'row' }}>
                                        {this.renderButtom(btnTexts.crop, () => {
                                            this.setState({ cropMode: true })
                                        }, 'crop')}
                                        {allowRotate
                                            && this.renderButtom(btnTexts.rotate, this.onRotateImage, 'rotate-left')}
                                        {this.renderButtom(btnTexts.done, () => {
                                            onPictureChoosed(uri)
                                            this.onToggleModal()
                                        }, 'check')}
                                    </View>
                                )
                                : this.renderButtom(
                                    processing ? btnTexts.processing : btnTexts.done,
                                    this.onCropImage,
                                    processing ? 'progress-check' : 'check',
                                )
                        }
                    </ScrollView>
                </SafeAreaView>
                <View style={{ flex: 1, backgroundColor: 'black' }}>
                    <ScrollView
                        style={{ position: 'relative', flex: 1 }}
                        maximumZoomScale={3}
                        minimumZoomScale={0.5}
                        onScroll={this.onHandleScroll}
                        bounces={false}
                        ref={(c) => { this.scrollView = c }}
                        scrollEventThrottle={16}
                        pinchGestureEnabled={pinchGestureEnabled}
                    >
                        <AutoHeightImage
                            style={{ backgroundColor: 'black' }}
                            source={{ uri }}
                            resizeMode="contain"
                            width={width}
                            onLayout={this.calculateMaxSizes}
                        />
                        {!!cropMode && (
                            <Animatable.View
                                onLayout={(event) => {
                                    this.currentSize.height = event.nativeEvent.layout.height
                                    this.currentSize.width = event.nativeEvent.layout.width
                                    this.currentPos.top = event.nativeEvent.layout.y
                                    this.currentPos.left = event.nativeEvent.layout.x
                                    this.leftBarrier = this.currentPos.left + this.currentSize.width * 0.8
                                    this.rightBarrier = this.currentSize.width * 0.2
                                    this.topBarrier = this.currentSize.height * 0.2 + 45
                                    this.bottomBarrier = this.currentPos.top + this.currentSize.height * 0.8
                                }}
                                ref={(ref) => {
                                    this.square = ref
                                }}
                                {...this._panResponder.panHandlers}
                                style={{
                                    borderStyle: 'solid',
                                    borderWidth: 2,
                                    borderColor,
                                    flex: 1,
                                    minHeight: 100,
                                    width: this.maxSizes.width,
                                    height: this.maxSizes.height,
                                    position: 'absolute',
                                    maxHeight: this.maxSizes.height,
                                    maxWidth: this.maxSizes.width,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',
                                    alignItems: 'stretch',
                                }}
                            >
                                <View
                                    style={{
                                        flex: 3,
                                        flexDirection: 'row',
                                    }}
                                >
                                    <TouchableOpacity
                                        style={{
                                            flex: 3,
                                            borderRightWidth: 1,
                                            borderBottomWidth: 1,
                                            borderColor: '#c9c9c9',
                                            borderStyle: 'solid',
                                        }}
                                        onPressIn={() => this.setCorner('tl')}
                                    >
                                        <View
                                            style={{
                                                position: 'absolute',
                                                left: 5,
                                                top: 5,
                                                borderLeftWidth: 2,
                                                borderTopWidth: 2,
                                                height: 48,
                                                width: 48,
                                                borderColor: '#f4f4f4',
                                                borderStyle: 'solid',
                                            }}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            flex: 3,
                                            borderRightWidth: 1,
                                            borderBottomWidth: 1,
                                            borderColor: '#c9c9c9',
                                            borderStyle: 'solid',
                                        }}
                                        onPress={this.onShouldMove}
                                    />
                                    <TouchableOpacity
                                        style={{
                                            flex: 3,
                                            borderBottomWidth: 1,
                                            borderColor: '#c9c9c9',
                                            borderStyle: 'solid',
                                        }}
                                        onPressIn={() => this.setCorner('tr')}
                                    >
                                        <View
                                            style={{
                                                position: 'absolute',
                                                right: 5,
                                                top: 5,
                                                borderRightWidth: 2,
                                                borderTopWidth: 2,
                                                height: 48,
                                                width: 48,
                                                borderColor: '#f4f4f4',
                                                borderStyle: 'solid',
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View
                                    style={{
                                        flex: 3,
                                        flexDirection: 'row',
                                    }}
                                >
                                    <TouchableOpacity
                                        style={{
                                            flex: 3,
                                            borderBottomWidth: 1,
                                            borderRightWidth: 1,
                                            borderColor: '#c9c9c9',
                                            borderStyle: 'solid',
                                        }}
                                        onPress={this.onShouldMove}
                                    />
                                    <TouchableOpacity
                                        style={{
                                            flex: 3,
                                            borderBottomWidth: 1,
                                            borderRightWidth: 1,
                                            borderColor: '#c9c9c9',
                                            borderStyle: 'solid',
                                        }}
                                        onPress={this.onShouldMove}
                                    />
                                    <TouchableOpacity
                                        style={{
                                            flex: 3,
                                            borderBottomWidth: 1,
                                            borderColor: '#c9c9c9',
                                            borderStyle: 'solid',
                                        }}
                                        onPress={this.onShouldMove}
                                    />
                                </View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        flex: 3,
                                    }}
                                >
                                    <TouchableOpacity
                                        style={{
                                            flex: 3,
                                            borderRightWidth: 1,
                                            borderColor: '#c9c9c9',
                                            borderStyle: 'solid',
                                            position: 'relative',
                                        }}
                                        onPressIn={() => this.setCorner('bl')}
                                    >
                                        <View
                                            style={{
                                                position: 'absolute',
                                                left: 5,
                                                bottom: 5,
                                                borderLeftWidth: 2,
                                                borderBottomWidth: 2,
                                                height: 48,
                                                width: 48,
                                                borderColor: '#f4f4f4',
                                                borderStyle: 'solid',
                                            }}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            flex: 3,
                                            borderRightWidth: 1,
                                            borderColor: '#c9c9c9',
                                            borderStyle: 'solid',
                                        }}
                                        onPress={this.onShouldMove}
                                    />
                                    <TouchableOpacity
                                        style={{ flex: 3, position: 'relative' }}
                                        onPressIn={() => this.setCorner('br')}
                                    >
                                        <View
                                            style={{
                                                position: 'absolute',
                                                right: 5,
                                                bottom: 5,
                                                borderRightWidth: 2,
                                                borderBottomWidth: 2,
                                                height: 48,
                                                width: 48,
                                                borderColor: '#f4f4f4',
                                                borderStyle: 'solid',
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </Animatable.View>
                        )
                        }
                    </ScrollView>
                </View>
            </Modal>
        )
    }
}

export default ImgManipulator


ImgManipulator.defaultProps = {
    onPictureChoosed: uri => console.log('URI:', uri),
    btnTexts: {
        crop: 'Crop',
        rotate: 'Rotate',
        done: 'Done',
        processing: 'Processing',
    },
    dragVelocity: 100,
    resizeVelocity: 50,
}

ImgManipulator.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onPictureChoosed: PropTypes.func,
    btnTexts: PropTypes.object,
    photo: PropTypes.object.isRequired,
    onToggleModal: PropTypes.func.isRequired,
    dragVelocity: PropTypes.number,
    resizeVelocity: PropTypes.number,
}
