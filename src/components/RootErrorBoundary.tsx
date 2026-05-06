import { Component, ErrorInfo, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * 최상위 ErrorBoundary.
 * - 화이트스크린(완전 크래시) 대신 폴백 UI 표시.
 * - 추후 Sentry 도입 시 componentDidCatch에서 captureException 호출.
 */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: Sentry 도입 시 Sentry.captureException(error, { contexts: { react: info } })
    if (__DEV__) {
      console.error('[RootErrorBoundary]', error, info.componentStack);
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    const isDev = __DEV__;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>문제가 발생했습니다</Text>
        <Text style={styles.subtitle}>
          잠시 후 다시 시도해주세요. 문제가 계속되면 앱을 종료 후 다시 실행해주세요.
        </Text>
        {isDev && (
          <ScrollView style={styles.devBox}>
            <Text style={styles.devText}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </Text>
          </ScrollView>
        )}
        <Pressable style={styles.button} onPress={this.reset}>
          <Text style={styles.buttonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  devBox: {
    width: '100%',
    maxHeight: 240,
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  devText: {
    fontFamily: 'Menlo',
    fontSize: 11,
    color: '#7f1d1d',
  },
  button: {
    backgroundColor: '#A9CCEC',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
  },
  buttonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
});
