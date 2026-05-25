import { Share } from 'react-native';

import { strings } from '@/constants/strings';

import {
  buildLoadLocationShareMessage,
  type LoadLocationSharePayload,
} from './format-coordinates';

export async function shareLoadLocation(payload: LoadLocationSharePayload): Promise<void> {
  const message = buildLoadLocationShareMessage(payload);
  await Share.share({
    message,
    title: strings.location.shareDialogTitle,
  });
}
