import React, { Component, ReactNode } from 'react';
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
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import AutoHeightImage from 'react-native-auto-height-image';
import ImageCropOverlay from './ImageCropOverlay';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import type { SaveOptions } from 'expo-image-manipulator';

const { width: screenWidth } = Dimensions.get('window');

LogBox.ignoreLogs(['componentWillReceiveProps', 'componentWillUpdate', 'componentWillMount']);
LogBox.ignoreLogs([
  'Warning: componentWillMount is deprecated',
  'Warning: componentWillReceiveProps is deprecated',
  'Module RCTImageLoader requires',
]);

type Size = {
  width: number;
  height: number;
};

type State = {
  uri: string | undefined;
  cropMode: boolean;
  processing: boolean;
  zoomScale: number;
  safeAreaHeight: number;
  imageLayout: { x: number, y: number; } & Size;
  enableScroll: boolean;
  scrollOffsetY: number;
  base64: string | undefined;
};

type ChoosedPicture = {
  uri: string,
  base64: string | undefined,
  width: number,
  height: number,
  cropped: boolean;
};

type Props = {
  borderColor?: string;
  isVisible: boolean;
  onPictureChoosed: (data: ChoosedPicture) => void;
  onBeforePictureChoosed?: (data: ChoosedPicture) => boolean;
  btnTexts: {
    crop?: string,
    rotate?: string,
    done?: string,
    processing?: string,
  };
  icons: {
    back?: ReactNode,
    crop?: ReactNode,
    processing?: ReactNode;
  };
  saveOptions?: SaveOptions;
  photo: {
    uri: string;
  };
  onToggleModal: () => void;
  ratio?: { width: number, height: number; };
  allowFlip?: boolean;
  allowRotate?: boolean;
  fixedMask?: Size;
};

class ImageManipulatorView extends Component<Props, State> {
  static defaultProps = {
    borderColor: '#a4a4a4',
    btnTexts: {
      crop: 'Crop',
      rotate: 'Rotate',
      done: 'Done',
      processing: 'Processing',
    },
    icons: {
      back: <MaterialIcons size={24} name="arrow-back-ios" color="white" />,
      crop: <FontAwesome style={{ marginRight: 5 }} size={20} name={'scissors'} color="white" />,
      processing: <MaterialIcons style={{ marginRight: 5 }} size={20} name={'access-time'} color="white" />
    },
    saveOptions: {
      compress: 1,
      format: ImageManipulator.SaveFormat.PNG,
      base64: false,
    },
    fixedMask: undefined,
  };

  currentPos: {
    left: number,
    top: number;
  };
  currentSize: Size;
  maxSizes: Size;
  actualSize: Size;
  cropped: boolean;

  constructor(props: Omit<Props, 'borderColor' | 'btnTexts'> & typeof ImageManipulatorView.defaultProps) {
    super(props);

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

    this.cropped = false;
  }

  async componentDidMount() {
    await this.onConvertImageToEditableSize();
  }

  onGetCorrectSizes = (w: number, h: number) => {
    const sizes = {
      convertedWidth: w,
      convertedheight: h,
    };
    const ratio = Math.min(1920 / w, 1080 / h);
    sizes.convertedWidth = Math.round(w * ratio);
    sizes.convertedheight = Math.round(h * ratio);
    return sizes;
  };

  async onConvertImageToEditableSize() {
    this.setState({ uri: undefined });
    const { photo: { uri: rawUri }, saveOptions } = this.props;
    Image.getSize(rawUri, async (imgW, imgH) => {
      const { convertedWidth, convertedheight } = this.onGetCorrectSizes(imgW, imgH);
      const { uri, width: w, height } = await ImageManipulator.manipulateAsync(rawUri,
        [
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
    });
  }

  get isRemote() {
    const { uri } = this.state;
    if (!uri) {
      throw new Error('state.uri is still undefined.');
    }

    return /^(http|https|ftp)?(?:[:/]*)([a-z0-9.-]*)(?::([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/.test(uri);
  }

  onToggleModal = () => {
    const { onToggleModal } = this.props;
    onToggleModal();
    this.setState({ cropMode: false });
  };

  onCropImage = () => {
    const { uri } = this.state;
    if (!uri) {
      return;
    }

    this.setState({ processing: true });
    Image.getSize(uri, async (actualWidth, actualHeight) => {
      const cropObj = this.getCropBounds(actualWidth, actualHeight);
      if (cropObj.height > 0 && cropObj.width > 0) {
        let uriToCrop = uri;
        if (this.isRemote) {
          const response = await FileSystem.downloadAsync(
            uri,
            FileSystem.documentDirectory + 'image',
          );
          uriToCrop = response.uri;
        }

        const {
          uri: uriCroped, base64, width: croppedWidth, height: croppedHeight,
        } = await this.crop(cropObj, uriToCrop);

        this.actualSize.width = croppedWidth;
        this.actualSize.height = croppedHeight;

        this.setState({
          uri: uriCroped, base64, cropMode: false, processing: false,
        }, () => this.cropped = true);
      } else {
        this.setState({ cropMode: false, processing: false });
      }
    });
  };

  onRotateImage = async () => {
    const { uri } = this.state;
    if (!uri) {
      return;
    }

    let uriToCrop = uri;
    if (this.isRemote) {
      const response = await FileSystem.downloadAsync(
        uri,
        FileSystem.documentDirectory + 'image',
      );
      uriToCrop = response.uri;
    }
    Image.getSize(uri, async (width, _height) => {
      const { uri: rotUri, base64 } = await this.rotate(uriToCrop, width);
      this.setState({ uri: rotUri, base64 });
    });
  };

  onFlipImage = async (orientation: ImageManipulator.FlipType) => {
    const { uri } = this.state;
    if (!uri) {
      return;
    }

    let uriToCrop = uri;
    if (this.isRemote) {
      const response = await FileSystem.downloadAsync(
        uri,
        FileSystem.documentDirectory + 'image',
      );
      uriToCrop = response.uri;
    }

    Image.getSize(uri, async () => {
      const { uri: rotUri, base64 } = await this.filp(uriToCrop, orientation);
      this.setState({ uri: rotUri, base64 });
    });
  };

  getCropBounds = (actualWidth: number, actualHeight: number) => {
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

  filp = async (uri: string, orientation: ImageManipulator.FlipType): Promise<ImageManipulator.ImageResult> => {
    const { saveOptions } = this.props;
    const manipResult = await ImageManipulator.manipulateAsync(uri, [{
      flip: orientation,
    }],
      saveOptions);
    return manipResult;
  };

  rotate = async (uri: string, width: number): Promise<ImageManipulator.ImageResult> => {
    const { saveOptions } = this.props;
    return await ImageManipulator.manipulateAsync(
      uri,
      [{ rotate: -90 }, { resize: { width: width } }],
      saveOptions
    );
  };

  crop = async (cropObj: ImageManipulator.ActionCrop['crop'], uri: string): Promise<ImageManipulator.ImageResult> => {
    const { saveOptions } = this.props;
    if (cropObj.height > 0 && cropObj.width > 0) {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{
          crop: cropObj,
        }],
        saveOptions,
      );
      return manipResult;
    }

    return {
      uri: uri,
      base64: undefined,
      width: 0,
      height: 0
    };
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
    await this.onConvertImageToEditableSize();
  }

  zoomImage() {
    // this.refs.imageScrollView.zoomScale = 5
    // this.setState({width: screenWidth})
    // this.setState({zoomScale: 5})

    // this.setState(curHeight)
  }

  render() {
    const {
      isVisible,
      onPictureChoosed,
      onBeforePictureChoosed,
      borderColor,
      allowRotate = true,
      allowFlip = true,
      btnTexts,
      fixedMask,
      ratio,
    } = this.props;
    const {
      uri,
      base64,
      cropMode,
      processing,
    } = this.state;

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
      } else {
        cropHeight = cropWidth * cropRatio;
      }

      if (cropRatio < 1) {
        cropMinWidth = cropMinHeight / cropRatio;
      } else {
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

    return (
      <Modal
        animationType="slide"
        transparent
        visible={isVisible}
        hardwareAccelerated
        onRequestClose={() => {
          this.onToggleModal();
        }}
      >
        <SafeAreaView
          style={{
            width: screenWidth, flexDirection: 'row', backgroundColor: 'black', justifyContent: 'space-between',
          }}
          onLayout={e => this.setState({ safeAreaHeight: e.nativeEvent.layout.height })}
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
                    {this.props.icons.back}
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
                          <TouchableOpacity onPress={() => this.onFlipImage(ImageManipulator.FlipType.Vertical)}
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

                          <TouchableOpacity onPress={() => this.onFlipImage(ImageManipulator.FlipType.Horizontal)}
                            style={{
                              marginLeft: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <MaterialIcons size={20} name="flip" color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => {
                            if (uri) {
                              Image.getSize(uri, (width, height) => {
                                let success = true;
                                const data: ChoosedPicture = {
                                  uri,
                                  base64,
                                  width,
                                  height,
                                  cropped: this.cropped
                                };

                                if (onBeforePictureChoosed) {
                                  success = onBeforePictureChoosed(data);
                                };

                                if (success) {
                                  onPictureChoosed(data);
                                  this.onToggleModal();
                                }
                              });
                            }
                          }}
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
                    {this.props.icons.back}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.onCropImage()}
                    style={{
                      marginRight: 10, alignItems: 'flex-end', flex: 1,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {processing ?
                        this.props.icons.processing
                        :
                        this.props.icons.crop
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
            onScrollEndDrag={e => this.setState({ scrollOffsetY: e.nativeEvent.contentOffset.y })}
          >
            {uri &&
              <AutoHeightImage
                source={{ uri }}
                resizeMode={'contain'}
                width={screenWidth}
                onLayout={e => this.setState({ imageLayout: e.nativeEvent.layout })}
              />
            }
            {!!cropMode && (
              <ImageCropOverlay
                onStartLayoutChange={() => this.setState({ enableScroll: false })}
                onLayoutChanged={(top, left, width, height) => {
                  this.currentSize.width = width;
                  this.currentSize.height = height;
                  this.currentPos.top = top;
                  this.currentPos.left = left;
                  this.setState({ enableScroll: true });
                }}
                initialWidth={(fixedMask && fixedMask.width) || cropWidth}
                initialHeight={(fixedMask && fixedMask.height) || cropHeight}
                initialTop={cropInitialTop}
                initialLeft={cropInitialLeft}
                minWidth={(fixedMask && fixedMask.width) || cropMinWidth}
                minHeight={(fixedMask && fixedMask.height) || cropMinHeight}
                borderColor={borderColor}
                ratio={ratio || undefined}
                safeAreaHeight={this.state.safeAreaHeight}
                imageLayout={this.state.imageLayout}
                scrollOffsetY={this.state.scrollOffsetY}
              />
            )
            }
          </ScrollView>
        </View>
      </Modal>
    );
  }
}

export default ImageManipulatorView;
