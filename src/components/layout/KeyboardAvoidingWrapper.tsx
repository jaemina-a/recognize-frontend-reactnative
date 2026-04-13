import {
    KeyboardAvoidingView,
    Platform,
    type KeyboardAvoidingViewProps,
} from 'react-native';

export function KeyboardAvoidingWrapper({
  children,
  ...props
}: KeyboardAvoidingViewProps) {
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
