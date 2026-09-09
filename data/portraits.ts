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
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const portraits = Object.fromEntries(
  Object.entries(data).map(([id, portrait]) => [
    id,
    { ...portrait, src: `${basePath}${portrait.src}` },
  ]),
) as Partial<Record<PersonId, Portrait>>;
