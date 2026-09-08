import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { createReviewRequester } from '../reviewPolicy';
import config from '../../app.json';

const KEY = 'meditation-timer:review-attempt:v1';
const requestOnce = createReviewRequester({
  available: StoreReview.isAvailableAsync,
  readAttempt: () => AsyncStorage.getItem(KEY),
  markAttempt: () => AsyncStorage.setItem(KEY, new Date().toISOString()),
  request: StoreReview.requestReview,
});
export function maybeRequestReview(completedCount: number, canPresent: () => boolean) {
  return requestOnce(completedCount, config.expo.extra.publicReviewsEnabled && !__DEV__ && Platform.OS !== 'web', canPresent);
}
