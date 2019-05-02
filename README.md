<h1 align="center">Expo image manipulator</h1>
<p align="center">Multi platform 🚀</p>

<p align="center">
   <img width="250" src="https://giant.gfycat.com/ElaborateSpicyHoneycreeper.gif"/>
   <br/>
   <br/>
   <br/>
   <br/>
   <a href="https://github.com/brunon80/expo-image-crop"><img alt="npm version" src="https://badge.fury.io/js/expo-image-crop.svg"/>
   <a href="https://github.com/brunon80/expo-image-crop"><img alt="npm version" src="https://img.shields.io/badge/platform-ios%2Fandroid-blue.svg"/>
   <a href="https://github.com/brunon80/expo-image-crop"><img alt="npm version" src="https://img.shields.io/badge/license-MIT-lightgrey.svg"/>
   <p align="center">
   
  <a href="https://exp.host/@koruja/expo-image-crop">Open on your device!</a>
</p>
</a>
</p>

## Crop and rotate image without detach your expo project!
## `Expo.ImageManipulator` is only a API without a UI, so you have to build your own UI on top of it, or choose detach your project to use third party linked packages, witch is no so good because a pure javascript Expo project is marvelous!

[PRs are welcome...](https://github.com/brunon80/expo-image-crop/pulls)

## Example

```javascript
import React from 'react'
import { Dimensions, Button, ImageBackground } from 'react-native'
import { ImageManipulator } from 'expo-image-crop'

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
```

## Props
* isVisible: `Bool` - Show or hide modal with image manipulator UI
* onPictureChoosed: `function` - Callback where is passed image edited as parameter
* photo: `object`
    * uri: `string` - uri of image to be edited
    * width: `number` - width of image to be edited (optional, used for large images due android bug, see: facebook/react-native#22145)
    * height: `number` - height of image to be edited (optional, used for large images due android bug, see: facebook/react-native#22145)
* onToggleModal: `function` - Callback called when modal is dismissed
* borderColor: `string` - Color for crop mask border
* allowRotate: `Bool` - Show rotate option
* pinchGestureEnabled: `Bool` - Disable/Enable pinch gesture

## Requirements
* Use it into Expo app (from expo client, Standalone app or ExpoKit app).
* Because we need to have access to `Expo.ImageManipulator`
* Only Expo SDK 25 or Higher

## Features
* Crop and rotate image with `Expo.ImageManipulator`

## If you have some problem open a issue

## TO DO

- [ ] [Android / IOS] Detect touches with more precision (Drag / Resizing)
- [ ] [Android / IOS] Better crop mask
