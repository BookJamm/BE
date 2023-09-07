import { BaseException } from 'src/global/base/base-exception';
import { PlaceResponseCode } from '../exception/place-response-code';

export enum PlaceCategory {
  INDI_STORE = 0,
  BOOK_PLAYGROUND = 1,
  LIBRARY = 2,
}

export const findPlaceCategoryByValue = (placeCategoryValue: number): PlaceCategory => {
  if (PlaceCategory[placeCategoryValue]) {
    return placeCategoryValue as PlaceCategory;
  } else {
    throw BaseException.of(PlaceResponseCode.INVALID_CATEGORY);
  }
};
