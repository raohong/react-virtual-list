import {
  ItemSize,
  ItemSizeGetter,
  EstimatedSizeGetter,
  DEFAULT_ESTIMATEDSIZE,
  CellCacheItem,
  DIRECTION,
  sizeProp
} from './types';
import CellCache from './CellCache';

export const getItemSizeGetter = (
  itemSize: ItemSize,
  cellCache?: CellCache<CellCacheItem>,
  scrollDirection?: DIRECTION,
  estimatedSizeGetter?: EstimatedSizeGetter
): ItemSizeGetter => {
  return (index: number) => {
    if (cellCache !== undefined) {
      const item = cellCache.get(index);
      return item ? item[sizeProp[scrollDirection!]] : estimatedSizeGetter!();
    }

    if (typeof itemSize === 'function') {
      return itemSize[index];
    }

    return Array.isArray(itemSize) ? itemSize[index] : itemSize;
  };
};

export const getEstimatedGetter = (
  estimatedSize: number,
  itemSize: ItemSize
): EstimatedSizeGetter => {
  return () =>
    estimatedSize ||
    (typeof itemSize === 'number' && itemSize) ||
    DEFAULT_ESTIMATEDSIZE;
};
