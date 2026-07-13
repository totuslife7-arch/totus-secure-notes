import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type KeyboardAwareScrollContextValue = {
  notifyInputFocus: (node: View | null) => void;
  notifyContentSizeChange: (node: View | null) => void;
};

const KeyboardAwareScrollContext = createContext<KeyboardAwareScrollContextValue | null>(null);

export function useKeyboardAwareScrollContext(): KeyboardAwareScrollContextValue | null {
  return useContext(KeyboardAwareScrollContext);
}

type KeyboardAwareScrollViewProps = ScrollViewProps & {
  /** Extra bottom padding when the keyboard is open (e.g. tab bar or fixed footer height). */
  extraBottomInset?: number;
  /** Override stack header offset for KeyboardAvoidingView (defaults to safe area + header). */
  keyboardVerticalOffset?: number;
};

const DEFAULT_HEADER_HEIGHT = Platform.select({ ios: 44, android: 56, default: 0 }) ?? 0;
const SCROLL_PADDING = 24;

const KeyboardAwareScrollView = forwardRef<ScrollView, KeyboardAwareScrollViewProps>(
  function KeyboardAwareScrollView(
    {
      children,
      contentContainerStyle,
      style,
      extraBottomInset = 0,
      keyboardVerticalOffset: keyboardVerticalOffsetProp,
      onScroll,
      ...props
    },
    ref,
  ) {
    const insets = useSafeAreaInsets();
    const scrollRef = useRef<ScrollView>(null);
    const scrollYRef = useRef(0);
    const focusedInputRef = useRef<View | null>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const keyboardVerticalOffset =
      keyboardVerticalOffsetProp ?? insets.top + DEFAULT_HEADER_HEIGHT;

    useEffect(() => {
      const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

      const showSub = Keyboard.addListener(showEvent, (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      });
      const hideSub = Keyboard.addListener(hideEvent, () => {
        setKeyboardHeight(0);
      });

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    const scrollInputIntoView = useCallback(
      (node: View | null) => {
        if (!node || !scrollRef.current) {
          return;
        }

        const runScroll = () => {
          node.measureInWindow((_x, inputY, _w, inputH) => {
            const windowHeight = Dimensions.get('window').height;
            const headerClearance = keyboardVerticalOffset;
            const visibleTop = headerClearance + SCROLL_PADDING;
            const visibleBottom =
              keyboardHeight > 0
                ? windowHeight - keyboardHeight - extraBottomInset - SCROLL_PADDING
                : windowHeight - extraBottomInset - SCROLL_PADDING;

            const inputBottom = inputY + inputH;

            if (inputBottom > visibleBottom) {
              const delta = inputBottom - visibleBottom;
              scrollRef.current?.scrollTo({ y: scrollYRef.current + delta, animated: true });
            } else if (inputY < visibleTop) {
              const delta = visibleTop - inputY;
              scrollRef.current?.scrollTo({ y: Math.max(0, scrollYRef.current - delta), animated: true });
            }
          });
        };

        if (Platform.OS === 'ios') {
          requestAnimationFrame(runScroll);
        } else {
          setTimeout(runScroll, 100);
        }
      },
      [extraBottomInset, keyboardHeight, keyboardVerticalOffset],
    );

    const notifyInputFocus = useCallback(
      (node: View | null) => {
        focusedInputRef.current = node;
        scrollInputIntoView(node);
      },
      [scrollInputIntoView],
    );

    const notifyContentSizeChange = useCallback(
      (node: View | null) => {
        if (node && focusedInputRef.current === node) {
          scrollInputIntoView(node);
        }
      },
      [scrollInputIntoView],
    );

    useEffect(() => {
      if (keyboardHeight > 0 && focusedInputRef.current) {
        scrollInputIntoView(focusedInputRef.current);
      }
    }, [keyboardHeight, scrollInputIntoView]);

    const contextValue = useMemo(
      (): KeyboardAwareScrollContextValue => ({
        notifyInputFocus,
        notifyContentSizeChange,
      }),
      [notifyInputFocus, notifyContentSizeChange],
    );

    const mergedContentContainerStyle = useMemo((): StyleProp<ViewStyle> => {
      const keyboardPadding = keyboardHeight > 0 ? keyboardHeight + extraBottomInset : 0;
      if (!keyboardPadding) {
        return contentContainerStyle;
      }
      return [contentContainerStyle, { paddingBottom: keyboardPadding }];
    }, [contentContainerStyle, extraBottomInset, keyboardHeight]);

    const setScrollRef = useCallback(
      (instance: ScrollView | null) => {
        scrollRef.current = instance;
        if (typeof ref === 'function') {
          ref(instance);
        } else if (ref) {
          ref.current = instance;
        }
      },
      [ref],
    );

    return (
      <KeyboardAwareScrollContext.Provider value={contextValue}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={keyboardVerticalOffset}>
          <ScrollView
            ref={setScrollRef}
            style={[styles.flex, style]}
            contentContainerStyle={mergedContentContainerStyle}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            nestedScrollEnabled
            contentInsetAdjustmentBehavior="automatic"
            scrollEventThrottle={16}
            onScroll={(event) => {
              scrollYRef.current = event.nativeEvent.contentOffset.y;
              onScroll?.(event);
            }}
            {...props}>
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </KeyboardAwareScrollContext.Provider>
    );
  },
);

export default KeyboardAwareScrollView;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
