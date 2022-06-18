import React, { ReactNode } from 'react';
import type { SaveOptions } from 'expo-image-manipulator';

type ExpoImageManipulatorProps = {
  borderColor?: string;
  isVisible: boolean;
  onPictureChoosed?: (props: { uri: string, base64: boolean; }) => void;
  btnTexts?: {
    crop?: string,
    rotate?: string,
    done?: string,
    processing?: string,
  };
  icons?: {
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
};

declare class ExpoImageManipulator extends React.Component<ExpoImageManipulatorProps, any>{ }

export default ExpoImageManipulator;