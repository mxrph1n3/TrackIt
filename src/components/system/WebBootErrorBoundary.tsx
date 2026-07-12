import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

/** Surfaces web boot crashes instead of a blank screen (e.g. on Vercel). */
export class WebBootErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[WebBootErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>TrackIt failed to start</Text>
          <Text style={styles.body}>
            Open browser DevTools (F12) for details. If this is a fresh Vercel deploy, check
            Environment Variables and redeploy without build cache.
          </Text>
          <Text style={styles.error}>{this.state.error.message}</Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  body: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  error: {
    color: '#F87171',
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
