import { Platform } from 'react-native';

/**
 * Micro-interaction sound generator for tactile mobile feedback
 */
class SoundEffects {
  playTap() {
    // Graceful silent/synthesized tap for mobile
  }

  playAddToCart() {
    // Graceful add to cart chime
  }

  playSuccess() {
    // Graceful success fanfare
  }
}

export const sound = new SoundEffects();
