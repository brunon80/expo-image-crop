import React from 'react'
import { Dimensions, Button, ImageBackground } from 'react-native'
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
              <ImageManipulator
                  photo={{ uri }}
                  isVisible={isVisible}
                  onPictureChoosed={uriM => this.setState({ uri: uriM })}
                  onToggleModal={this.onToggleModal}
              />
          </ImageBackground>
      )
  }
}
