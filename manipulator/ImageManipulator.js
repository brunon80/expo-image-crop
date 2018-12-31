import React, { Component } from 'react'
import {
    PanResponder, Dimensions, Image, ScrollView, Modal, View, Text,
} from 'react-native'
import * as Animatable from 'react-native-animatable'
import { ImageManipulator, FileSystem } from 'expo'
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

        this.state = {
            cropMode: false,
            uri: '',
        }

        this.scrollOffset = 0

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
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            onPanResponderGrant: () => {},
            onPanResponderMove: (evt, gestureState) => {
                if (!this.isResizing && gestureState.x0 < this.currentPos.left + this.currentSize.width * 0.9) {
                    this.square.transitionTo({ left: gestureState.moveX - this.currentSize.width / 2, top: gestureState.moveY + this.scrollOffset - this.currentSize.height / 2 - 45 /**  OFFSET */ }, 0)
                } else {
                    this.isResizing = true
                    const squareWidth = gestureState.moveX - this.currentPos.left
                    const squareHeight = gestureState.moveY - this.currentPos.top + this.scrollOffset - 45 /** OFFSET */
                    this.square.transitionTo({ width: squareWidth < 100 ? 100 : squareWidth, height: squareHeight < 10 ? 10 : squareHeight }, 0)
                }
            },
            onPanResponderTerminationRequest: () => true,
            onPanResponderRelease: () => {
                this.isResizing = false
            // The user has released all touches while this view is the
            // responder. This typically means a gesture has succeeded
            },
            onPanResponderTerminate: () => {
            // Another component has become the responder, so this gesture
            // should be cancelled
            },
            onShouldBlockNativeResponder: () => true
            ,
        })
    }

    onToggleModal = () => {
        const { onToggleModal } = this.props
        onToggleModal()
        this.setState({ cropMode: false })
    }

    onCropImage = () => {
        let imgWidth
        let imgHeight
        const { photo } = this.props
        Image.getSize(photo.uri, (width2, height2) => {
            imgWidth = width2
            imgHeight = height2
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
            // console.log('onPanResponderRelease', cropObj)
            // console.log('imgHeight', imgHeight)
            // console.log('this.maxSizes.height', maxSizes.height)
            // console.log('offsetMaxHeight', offsetMaxHeight)
            // console.log('offsetMaxHeight', offsetMaxHeight)
            // console.log('OUT OF BOUNDS Y', isOutOfBoundsY)
            // console.log('offsetMaxWidth', offsetMaxWidth)
            // console.log('OUT OF BOUNDS X', isOutOfBoundsX)
            const oldURI = photo.uri
            const { onPictureChoosed } = this.props
            const isRemote = /^(http|https|ftp)?(?:[\:\/]*)([a-z0-9\.-]*)(?:\:([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/.test(photo.uri)
            if (!isRemote) {
                if (cropObj.height > 0 && cropObj.width > 0) {
                    ImageManipulator.manipulateAsync(
                        photo.uri,
                        [{
                            crop: cropObj,
                        }],
                        { format: 'png' },
                    ).then((manipResult) => {
                        this.onToggleModal()
                        onPictureChoosed(manipResult.uri)
                        // setTimeout(() => {
                        //     onPictureChoosed(oldURI)
                        // }, 2000)
                    }).catch(error => console.log(error))
                }
            } else {
                FileSystem.downloadAsync(
                    photo.uri,
                    FileSystem.documentDirectory + 'image',
                ).then(({ uri }) => {
                    if (cropObj.height > 0 && cropObj.width > 0) {
                        ImageManipulator.manipulateAsync(
                            uri,
                            [{
                                crop: cropObj,
                            }],
                            { format: 'png' },
                        ).then((manipResult) => {
                            this.onToggleModal()
                            onPictureChoosed(manipResult.uri)
                            // setTimeout(() => {
                            //     onPictureChoosed(oldURI)
                            // }, 2000)
                        }).catch(error => console.log(error))
                    }
                }).catch(error => console.log(error))
            }
        })
        this.setState({ cropMode: false })
    }

    onRotateImage = () => {
        const { onPictureChoosed, photo } = this.props
        const isRemote = /^(http|https|ftp)?(?:[\:\/]*)([a-z0-9\.-]*)(?:\:([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/.test(photo.uri)
        if (!isRemote) {
            Image.getSize(photo.uri, (width2, height2) => {
                ImageManipulator.manipulateAsync(photo.uri, [{
                    rotate: -90,
                }, {
                    resize: {
                        width: height2,
                        height: width2,
                    },
                }], {
                    compress: 1,
                }).then((rotPhoto) => {
                    onPictureChoosed(rotPhoto.uri)
                    this.setState({ uri: rotPhoto.uri })
                })
            })
        } else {
            FileSystem.downloadAsync(
                photo.uri,
                FileSystem.documentDirectory + 'image.jpg',
            ).then(({ uri }) => {
                Image.getSize(uri, (width2, height2) => {
                    ImageManipulator.manipulateAsync(uri, [{
                        rotate: -90,
                    }, {
                        resize: {
                            width: height2,
                            height: width2,
                        },
                    }], {
                        compress: 1,
                    }).then((rotPhoto) => {
                        onPictureChoosed(rotPhoto.uri)
                        this.setState({ uri: rotPhoto.uri })
                    })
                })
            })
        }
    }

    onHandleScroll = (event) => {
        this.scrollOffset = event.nativeEvent.contentOffset.y
    }

    renderButtom = (title, action, icon) => (
        <HybridTouch onPress={action}>
            <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}>
                <Icon size={20} name={icon} color="white" />
                <Text style={{ color: 'white', fontSize: 15, marginLeft: 5 }}>{title}</Text>
            </View>
        </HybridTouch>
    )

    render() {
        const { isVisible, onPictureChoosed, photo } = this.props
        const {
            uri, cropMode,
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
                <View
                    style={{
                        width, backgroundColor: 'black', flexDirection: 'row', justifyContent: 'space-between',
                    }}
                >
                    {this.renderButtom('', this.onToggleModal, 'arrow-left')}
                    {
                        !cropMode
                            ? (
                                <View style={{ flexDirection: 'row' }}>
                                    {this.renderButtom('Crop', () => {
                                        this.setState({ cropMode: true })
                                    }, 'crop')}
                                    {this.renderButtom('Rotate', this.onRotateImage, 'rotate-left')}
                                    {this.renderButtom('Done', () => {
                                        onPictureChoosed(uri)
                                        this.onToggleModal()
                                    }, 'check')}
                                </View>
                            )
                            : this.renderButtom('Done', this.onCropImage, 'check')
                    }
                </View>
                <View style={{ flex: 1, backgroundColor: 'black' }}>
                    <ScrollView
                        style={{ position: 'relative', flex: 1 }}
                        maximumZoomScale={3}
                        minimumZoomScale={0.5}
                        onScroll={this.onHandleScroll}
                        bounces={false}
                    >
                        <AutoHeightImage
                            style={{ backgroundColor: 'black' }}
                            source={{ uri: photo.uri }}
                            resizeMode="contain"
                            width={width}
                            onLayout={(event) => {
                                this.maxSizes.width = event.nativeEvent.layout.width || 100
                                this.maxSizes.height = event.nativeEvent.layout.height || 100
                            }}
                        />
                        {
                            !!cropMode
                        && (
                            <Animatable.View
                                onLayout={(event) => {
                                    this.currentSize.height = event.nativeEvent.layout.height
                                    this.currentSize.width = event.nativeEvent.layout.width
                                    this.currentPos.top = event.nativeEvent.layout.y
                                    this.currentPos.left = event.nativeEvent.layout.x
                                }}
                                ref={(ref) => { this.square = ref }}
                                {...this._panResponder.panHandlers}
                                style={{
                                    borderStyle: 'dashed',
                                    borderRadius: 5,
                                    borderWidth: 3,
                                    borderColor: 'yellow',
                                    flex: 1,
                                    width: this.maxSizes.width,
                                    height: this.maxSizes.height,
                                    position: 'absolute',
                                    maxHeight: this.maxSizes.height,
                                    maxWidth: this.maxSizes.width,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                }}
                            />
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
}

ImgManipulator.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onPictureChoosed: PropTypes.func,
    photo: PropTypes.object.isRequired,
    onToggleModal: PropTypes.func.isRequired,
}
