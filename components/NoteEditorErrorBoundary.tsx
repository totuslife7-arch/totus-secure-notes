import React, { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  children: ReactNode;
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
};

type State = {
  hasError: boolean;
  message: string;
};

export default class NoteEditorErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'Something went wrong in the note editor.';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    if (__DEV__) {
      console.warn('[NoteEditorErrorBoundary]', error);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.container, { backgroundColor: this.props.backgroundColor }]}>
          <Text style={[styles.title, { color: this.props.textColor }]}>Note editor error</Text>
          <Text style={[styles.body, { color: this.props.textColor }]}>{this.state.message}</Text>
          <Pressable
            style={[styles.button, { backgroundColor: this.props.primaryColor }]}
            onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  button: { borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
