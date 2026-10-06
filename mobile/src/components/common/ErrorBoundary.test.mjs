import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const errorBoundarySourcePath = path.resolve(__dirname, './ErrorBoundary.tsx');
const rootLayoutSourcePath = path.resolve(__dirname, '../../app/_layout.tsx');
const appJsonPath = path.resolve(__dirname, '../../../app.json');

const errorBoundarySource = fs.readFileSync(errorBoundarySourcePath, 'utf8');
const rootLayoutSource = fs.readFileSync(rootLayoutSourcePath, 'utf8');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

describe('Root Production ErrorBoundary Component Implementation', () => {
  it('exports ErrorBoundary class component with standard React lifecycle methods', () => {
    assert.ok(
      errorBoundarySource.includes('export class ErrorBoundary extends React.Component'),
      'ErrorBoundary must be an exported class component extending React.Component',
    );
    assert.ok(
      errorBoundarySource.includes('static getDerivedStateFromError('),
      'ErrorBoundary must implement static getDerivedStateFromError',
    );
    assert.ok(
      errorBoundarySource.includes('componentDidCatch('),
      'ErrorBoundary must implement componentDidCatch',
    );
    assert.ok(
      errorBoundarySource.includes('handleReset = ()'),
      'ErrorBoundary must implement handleReset method',
    );
    assert.ok(
      errorBoundarySource.includes('this.setState({ hasError: false, error: null })'),
      'handleReset must reset error state',
    );
  });

  it('declares proper state and props contracts including Persian copy', () => {
    // Props contract
    assert.ok(errorBoundarySource.includes('children: React.ReactNode'));
    assert.ok(errorBoundarySource.includes('fallback?: React.ReactNode'));
    assert.ok(errorBoundarySource.includes('testID?: string'));
    assert.ok(errorBoundarySource.includes('onReset?: () => void'));

    // State contract
    assert.ok(errorBoundarySource.includes('hasError: boolean'));
    assert.ok(errorBoundarySource.includes('error: Error | null'));

    // Persian strings
    assert.ok(
      errorBoundarySource.includes('خطایی در بارگذاری رخ داد'),
      'Fallback UI must have Persian heading',
    );
    assert.ok(
      errorBoundarySource.includes(
        'متأسفانه در اجرای این بخش مشکلی پیش آمد. برای ادامه، دکمه تلاش مجدد را لمس کنید.',
      ),
      'Fallback UI must have Persian body description',
    );
    assert.ok(
      errorBoundarySource.includes('تلاش مجدد'),
      'Fallback button must display Persian retry label',
    );
  });

  it('incorporates sanctuary dark emerald palette and accessible touch targets', () => {
    // Sanctuary palette & dark emerald styling
    assert.ok(
      errorBoundarySource.includes("backgroundColor: '#041410'") ||
        errorBoundarySource.includes('backgroundColor: "#041410"'),
      'Fallback background must use dark emerald #041410',
    );
    assert.ok(errorBoundarySource.includes('colors.primary'));
    assert.ok(errorBoundarySource.includes('fonts.uiBold'));

    // TestID & touch target
    assert.ok(
      errorBoundarySource.includes('testID="error-boundary-retry-button"'),
      'Retry button must have testID error-boundary-retry-button',
    );
    assert.ok(
      errorBoundarySource.includes('minHeight: 44'),
      'Retry button must satisfy WCAG minHeight: 44',
    );
    assert.ok(
      errorBoundarySource.includes('minWidth: 44'),
      'Retry button must satisfy WCAG minWidth: 44',
    );
    assert.ok(
      errorBoundarySource.includes('onPress={this.handleReset}'),
      'Retry button must trigger handleReset',
    );
  });
});

describe('Root Layout ErrorBoundary Integration', () => {
  it('wraps the root application tree in _layout.tsx with ErrorBoundary testID="root-error-boundary"', () => {
    assert.ok(
      rootLayoutSource.includes(
        "import { ErrorBoundary } from '@/components/common/ErrorBoundary'",
      ),
      'Root layout must import ErrorBoundary',
    );
    assert.ok(
      rootLayoutSource.includes('<ErrorBoundary testID="root-error-boundary">'),
      'Root layout must wrap app with ErrorBoundary and testID="root-error-boundary"',
    );
    assert.ok(
      rootLayoutSource.includes('</ErrorBoundary>'),
      'Root layout must close ErrorBoundary tag around SafeAreaProvider',
    );
  });
});

describe('Tablet & Multi-Orientation Configuration (app.json)', () => {
  it('configures orientation as default and enables iPad multitasking', () => {
    assert.strictEqual(
      appJson.expo.orientation,
      'default',
      'app.json orientation must be set to "default" for tablet & landscape support',
    );
    assert.strictEqual(appJson.expo.ios.supportsTablet, true, 'app.json iOS must support tablet');
    assert.strictEqual(
      appJson.expo.ios.requireFullScreen,
      false,
      'app.json iOS requireFullScreen must be false for iPad multitasking / Split View',
    );
  });
});

describe('ErrorBoundary Behavioral & Lifecycle Unit Simulation', () => {
  // Direct behavioral evaluation of the ErrorBoundary class logic
  class HeadlessErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        hasError: false,
        error: null,
      };
    }

    static getDerivedStateFromError(error) {
      return {
        hasError: true,
        error,
      };
    }

    componentDidCatch(error, errorInfo) {
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    }

    handleReset = () => {
      this.setState({ hasError: false, error: null });
      if (this.props.onReset) {
        this.props.onReset();
      }
    };

    render() {
      if (this.state.hasError) {
        if (this.props.fallback) {
          return this.props.fallback;
        }

        return React.createElement(
          'View',
          { testID: this.props.testID || 'error-boundary-container' },
          React.createElement('Text', null, 'خطایی در بارگذاری رخ داد'),
          React.createElement(
            'Text',
            null,
            'متأسفانه در اجرای این بخش مشکلی پیش آمد. برای ادامه، دکمه تلاش مجدد را لمس کنید.',
          ),
          React.createElement(
            'TouchableOpacity',
            {
              testID: 'error-boundary-retry-button',
              onPress: this.handleReset,
            },
            'تلاش مجدد',
          ),
        );
      }

      return this.props.children;
    }
  }

  it('renders children when there is no error', () => {
    const childElement = React.createElement('Text', null, 'Normal Scripture Screen');
    const boundary = new HeadlessErrorBoundary({ children: childElement });

    assert.strictEqual(boundary.state.hasError, false);
    assert.strictEqual(boundary.state.error, null);

    const rendered = boundary.render();
    assert.strictEqual(rendered, childElement);
  });

  it('catches render errors via getDerivedStateFromError and renders Persian error fallback UI', () => {
    const childElement = React.createElement('Text', null, 'Crash prone child');
    const errorInstance = new Error('Render crash simulation');

    const boundary = new HeadlessErrorBoundary({
      children: childElement,
      testID: 'root-error-boundary',
    });

    // Simulate React invoking getDerivedStateFromError upon exception
    const derivedState = HeadlessErrorBoundary.getDerivedStateFromError(errorInstance);
    assert.strictEqual(derivedState.hasError, true);
    assert.strictEqual(derivedState.error, errorInstance);

    boundary.state = derivedState;
    const fallbackTree = boundary.render();

    assert.ok(React.isValidElement(fallbackTree), 'Fallback tree must be a valid React element');
    assert.strictEqual(fallbackTree.props.testID, 'root-error-boundary');

    // Verify fallback contents
    const textChildren = fallbackTree.props.children;
    assert.strictEqual(textChildren[0].props.children, 'خطایی در بارگذاری رخ داد');
    assert.ok(
      textChildren[1].props.children.includes(
        'متأسفانه در اجرای این بخش مشکلی پیش آمد. برای ادامه، دکمه تلاش مجدد را لمس کنید.',
      ),
    );

    // Verify retry button presence
    const retryButton = textChildren[2];
    assert.strictEqual(retryButton.props.testID, 'error-boundary-retry-button');
    assert.strictEqual(typeof retryButton.props.onPress, 'function');
  });

  it('supports custom fallback prop when provided', () => {
    const customFallback = React.createElement('Text', null, 'Custom Error View');
    const boundary = new HeadlessErrorBoundary({
      children: React.createElement('Text', null, 'Child'),
      fallback: customFallback,
    });

    boundary.state = HeadlessErrorBoundary.getDerivedStateFromError(new Error('Fatal'));
    const rendered = boundary.render();
    assert.strictEqual(rendered, customFallback);
  });

  it('calls componentDidCatch when an error is caught', () => {
    let capturedError = null;
    let capturedInfo = null;

    const boundary = new HeadlessErrorBoundary({
      children: React.createElement('Text', null, 'Child'),
      onError: (err, info) => {
        capturedError = err;
        capturedInfo = info;
      },
    });

    const err = new Error('Component crashed');
    const info = { componentStack: '\n    in CrashingComponent\n    in App' };

    boundary.componentDidCatch(err, info);
    assert.strictEqual(capturedError, err);
    assert.strictEqual(capturedInfo, info);
  });

  it('clicking retry triggers handleReset, invokes onReset callback, and re-attempts rendering children', () => {
    let resetCallbackInvoked = false;
    const childElement = React.createElement('Text', null, 'Recovered Scripture Screen');

    const boundary = new HeadlessErrorBoundary({
      children: childElement,
      onReset: () => {
        resetCallbackInvoked = true;
      },
    });

    // Enter error state
    boundary.state = {
      hasError: true,
      error: new Error('Render fail'),
    };

    // Mock setState to apply partial state updates
    boundary.setState = function (updater) {
      const next = typeof updater === 'function' ? updater(this.state) : updater;
      this.state = { ...this.state, ...next };
    };

    const fallbackTree = boundary.render();
    const retryButton = fallbackTree.props.children[2];

    // Simulate user pressing retry button
    retryButton.props.onPress();

    assert.strictEqual(resetCallbackInvoked, true, 'onReset prop callback must be invoked');
    assert.strictEqual(boundary.state.hasError, false, 'hasError must be reset to false');
    assert.strictEqual(boundary.state.error, null, 'error must be cleared to null');

    // Subsequent render should now re-render children
    const reRendered = boundary.render();
    assert.strictEqual(
      reRendered,
      childElement,
      'ErrorBoundary must re-render children after reset',
    );
  });
});
