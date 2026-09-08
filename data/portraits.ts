import data from './portraits.json';
import type { PersonId } from './types';
export type Portrait = {
  src: string;
  sourceUrl: string;
  imageUrl: string;
  credit: string;
  license: string;
  objectPosition?: string;
  licenseUrl?: string;
  crop?: {
    left: number;
    top: number;
    width: number;
    height: number;
    imageWidth: number;
    imageHeight: number;
  };
};
export const portraits = data as Partial<Record<PersonId, Portrait>>;
