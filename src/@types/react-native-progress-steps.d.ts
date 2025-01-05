declare module 'react-native-progress-steps' {
  import { ComponentType, ReactNode } from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  export interface ProgressStepProps {
    label?: string;
    onNext?: () => void;
    onPrevious?: () => void;
    onSubmit?: () => void;
    nextBtnText?: string;
    previousBtnText?: string;
    finishBtnText?: string;
    nextBtnStyle?: ViewStyle;
    previousBtnStyle?: ViewStyle;
    nextBtnTextStyle?: TextStyle;
    previousBtnTextStyle?: TextStyle;
    removeBtnRow?: boolean;
    children?: ReactNode; // Ajout de la propriété `children` pour inclure les éléments enfants
  }

  export interface ProgressStepsProps {
    activeStep?: number;
    topOffset?: number;
    marginBottom?: number;
    borderWidth?: number;
    activeStepIconBorderColor?: string;
    progressBarColor?: string;
    completedProgressBarColor?: string;
    completedStepIconColor?: string;
    activeStepIconColor?: string;
    activeLabelColor?: string;
    disabledStepIconColor?: string;
    labelFontFamily?: string;
    labelColor?: string;
    completedLabelColor?: string;
  }

  export const ProgressStep: ComponentType<ProgressStepProps>;
  export const ProgressSteps: ComponentType<ProgressStepsProps>;
}
