import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';

/** Lets non-component code (e.g. session expiry) navigate. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
