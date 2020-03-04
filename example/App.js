import React from 'react'
import {
    Dimensions, View, Image, Text,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'
import Icon from 'react-native-vector-icons/MaterialIcons'
import ImageManipulator from './manipulator/ImageManipulator'

import HybridTouch from './HybridTouch'

const noImage = require('./assets/no_image.png')

export default class App extends React.Component {
    state = {
        isVisible: false,
        uri: null,
    }
    onToggleModal = () => {
        const { isVisible } = this.state
        this.setState({ isVisible: !isVisible })
    }
    _pickImage = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
        if (status === 'granted') {
            const result = await ImagePicker.launchImageLibraryAsync()
            if (!result.cancelled) {
                this.setState({
                    uri: result.uri,
                }, () => this.setState({ isVisible: true }))
            }
        }
    };

    _pickCameraImage = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA)
        if (status === 'granted') {
            const result = await ImagePicker.launchCameraAsync()

            if (!result.cancelled) {
                this.setState({
                    uri: result.uri,
                }, () => this.setState({ isVisible: true }))
            }
        }
    };

    render() {
        const {
            uri, isVisible,
        } = this.state
        const { width, height } = Dimensions.get('window')
        return (
            <View style={{
                backgroundColor: '#fcfcfc',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                height,
            }}
            >
                {uri ? (
                    <Image resizeMode="contain"
                        style={{
                            width, height, marginBottom: 40, backgroundColor: '#fcfcfc',
                        }}
                        source={{ uri }}
                    />
                ) : <Image source={noImage} />}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    backgroundColor: '#2c98fd',
                    width,
                    position: 'absolute',
                    bottom: 0,
                    padding: 20,
                }}
                >
                    <HybridTouch style={{ flex: 1, alignItems: 'center' }} onPress={() => this._pickImage()}>
                        <View style={{ alignItems: 'center' }}>
                            <Icon size={30} name="photo" color="white" />
                            <Text style={{ color: 'white', fontSize: 18 }}>Galery</Text>
                        </View>
                    </HybridTouch>
                    <HybridTouch style={{ flex: 1, alignItems: 'center' }} onPress={() => this._pickCameraImage()}>
                        <View style={{ alignItems: 'center' }}>
                            <Icon size={30} name="photo-camera" color="white" />
                            <Text style={{ color: 'white', fontSize: 18 }}>Camera</Text>
                        </View>
                    </HybridTouch>
                </View>
                {
                    uri
                && (
                    <ImageManipulator
                        photo={{ uri }}
                        isVisible={isVisible}
                        onPictureChoosed={(data) => {
                            // console.log(data)
                            this.setState({ uri: data.uri })
                        }}
                        // fixedMask={{ width: 200, height: 200 }}
                        onToggleModal={this.onToggleModal}
                        saveOptions={{
                            compress: 1,
                            format: 'png',
                            base64: true,
                        }}
                        btnTexts={{
                            done: 'Ok',
                            crop: 'Cortar',
                            processing: 'Processando',
                        }}
                    />
                )
                }
            </View>
        )
    }
}
