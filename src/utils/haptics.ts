import { Platform } from 'react-native';

let RNHapticFeedback: any = null;
try {
  RNHapticFeedback = require('react-native-haptic-feedback').default || require('react-native-haptic-feedback');
} catch {
  // Graceful fallback
}

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const haptic = {
  light: () => {
    try {
      if (RNHapticFeedback?.trigger) {
        RNHapticFeedback.trigger('impactLight', options);
      }
    } catch {
      // Silently ignore
    }
  },

  medium: () => {
    try {
      if (RNHapticFeedback?.trigger) {
        RNHapticFeedback.trigger('impactMedium', options);
      }
    } catch {
      // Silently ignore
    }
  },

  heavy: () => {
    try {
      if (RNHapticFeedback?.trigger) {
        RNHapticFeedback.trigger('impactHeavy', options);
      }
    } catch {
      // Silently ignore
    }
  },

  success: () => {
    try {
      if (RNHapticFeedback?.trigger) {
        RNHapticFeedback.trigger('notificationSuccess', options);
      }
    } catch {
      // Silently ignore
    }
  },

  warning: () => {
    try {
      if (RNHapticFeedback?.trigger) {
        RNHapticFeedback.trigger('notificationWarning', options);
      }
    } catch {
      // Silently ignore
    }
  },

  error: () => {
    try {
      if (RNHapticFeedback?.trigger) {
        RNHapticFeedback.trigger('notificationError', options);
      }
    } catch {
      // Silently ignore
    }
  },

  selection: () => {
    try {
      if (RNHapticFeedback?.trigger) {
        RNHapticFeedback.trigger('selection', options);
      }
    } catch {
      // Silently ignore
    }
  },
};
