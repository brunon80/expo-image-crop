import React from 'react'
import {
    Dimensions, Button, ImageBackground, View,
} from 'react-native'
import { ImagePicker, Permissions } from 'expo'
import ImageManipulator from './manipulator/ImageManipulator'

export default class App extends React.Component {
  state = {
      isVisible: false,
      uri: 'https://i.pinimg.com/originals/39/42/a1/3942a180299d5b9587c2aa8e09d91ecf.jpg',
  }
  onToggleModal = () => {
      const { isVisible } = this.state
      this.setState({ isVisible: !isVisible })
  }
  _pickImage = async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      if (status === 'granted') {
          const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [4, 3],
          })

          if (!result.cancelled) {
              this.setState({ uri: result.uri })
          }
      }
  };

  _pickCameraImage = async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA)
      if (status === 'granted') {
          const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
          })

          if (!result.cancelled) {
              this.setState({ uri: result.uri })
          }
      }
  };

  render() {
      const { uri, isVisible } = this.state
      const { width, height } = Dimensions.get('window')
      return (
          <ImageBackground
              resizeMode="contain"
              style={{
                  justifyContent: 'center', padding: 20, alignItems: 'center', height, width, backgroundColor: 'black',
              }}
              source={{ uri }}
          >
              <Button title="Open Image Editor" onPress={() => this.setState({ isVisible: true })} />
              <View style={{ margin: 20 }} />
              <Button title="Get Image from Image Library" onPress={() => this._pickImage()} />
              <View style={{ margin: 20 }} />
              <Button title="Take Picture" onPress={() => this._pickCameraImage()} />
              {
                  isVisible
              && (
                  <ImageManipulator
                      photo={{ uri }}
                      isVisible={isVisible}
                      onPictureChoosed={uriM => this.setState({ uri: uriM })}
                      onToggleModal={this.onToggleModal}
                  />
              )
              }
          </ImageBackground>
      )
  }
}
