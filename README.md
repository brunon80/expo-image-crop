<h1 align="center">Expo image manipulator</h1>
<p align="center">Multi platform 🚀</p>

<p align="center">
   <img width="250" src="./demo.gif"/>
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

>**Help Needed**: Remove flickering while resizing image, if you know why open a issue or a PR

>Updated to Expo SDK 36

>New Crop UI


### Install Dependences
- yarn add react-native-vector-icons
- expo install expo-permissions
- expo install expo-image-picker
- expo install expo-file-system
- expo install expo-image-manipulator

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
                  onPictureChoosed={({ uri: uriM }) => this.setState({ uri: uriM })}
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
* btnTexts: `object`
    * crop: `string` - name for crop text
    * rotate: `string` - name for rotate text
    * done: `string` - name for done text
    * processing: `string` - name for processing text
* onToggleModal: `function` - Callback called when modal is dismissed
* borderColor: `string` - Color for crop mask border
* allowRotate: `boolean` - Show rotate option
* pinchGestureEnabled: `boolean` - Disable/Enable pinch gesture
* squareAspect: `boolean` - Disable/Enable the square aspect of crop mask
* dragVelocity: `number` - Ajustable drag velocity
* resizeVelocity: `number` - Ajustable resize velocity
* saveOptions `object` - A map defining how modified image should be saved
    * compress `number` - A value in range 0.0 - 1.0 specifying compression level of the result image. 1 means no compression (highest quality) and 0 the highest compression (lowest quality).
    * format `string` - ImageManipulator.SaveFormat.{JPEG, PNG}. Specifies what type of compression should be used and what is the result file extension. SaveFormat.PNG compression is lossless but slower, SaveFormat.JPEG is faster but the image has visible artifacts. Defaults to SaveFormat.PNG.
    * base64 `boolea` - Whether to also include the image data in Base64 format.

## Return of onPictureChoosed is an object with format:

```javascript
{
    uri: string,
    base64: string // undefined if base64 is false on saveOptions prop
}
```
## Run the example!
- Clone this repository
- cd example/
- run yarn or npm install
- enjoy!


## Requirements
* Use it into Expo app (from expo client, Standalone app or ExpoKit app).
* Because we need to have access to `Expo.ImageManipulator`
* Only Expo SDK 33 or Higher

## Features
* Crop and rotate image with `Expo.ImageManipulator`

## Kown Issues
* On some devices always only crops the upper left side of the image, [see here.](https://github.com/brunon80/expo-image-crop/issues/15)

## If you have some problem open a issue

## TO DO

- [ ] [Android / IOS] Detect touches with more precision (Drag / Resizing)
- [x] [Android / IOS] Better crop mask
