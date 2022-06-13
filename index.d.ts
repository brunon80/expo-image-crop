import React from 'react';
import type { SaveOptions } from 'expo-image-manipulator';

type ImageManipulatorProps = {
  borderColor?: string;
  isVisible: boolean;
  onPictureChoosed?: ({uri: string, base64: boolean}) => void;
  btnTexts?: {
    crop: string,
    rotate: string,
    done: string,
    processing: string,
  };
  saveOptions?: SaveOptions;
  photo: {
    uri: string;
  },
  onToggleModal: () => void;
  ratio?: {width: number, height: number};
  allowFlip?: boolean;
  allowRotate?: boolean;
}

type ImageManipulatorState = {
  uri: string;
  base64: boolean;
  cropMode: boolean;
  processing: boolean;
  zoomScale: number;
}

export class ImageManipulator extends React.Component<ImageManipulatorProps, ImageManipulatorState>{
  isRemote: boolean;
}