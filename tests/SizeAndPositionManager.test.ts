import SizeAndPositionManager from '../src/SizeAndPositionManger';
import { ALIGN } from '@/types';

const DEFAULT_ITEMCOUNT = 1000;
const DEFAULT_ITEMSIZE = 50;
const DEFAULT_ESTIMATEDSIZE = 50;

interface IParams {
  itemSize?: number;
  estimatedSize?: number;
  itemCount?: number;
}

const getSizeAndPositionManager = (
  params: IParams = {
    itemSize: DEFAULT_ITEMSIZE,
    estimatedSize: DEFAULT_ESTIMATEDSIZE,
    itemCount: DEFAULT_ITEMCOUNT
  }
) => {
  const {
    itemSize = DEFAULT_ITEMSIZE,
    estimatedSize = DEFAULT_ESTIMATEDSIZE,
    itemCount = DEFAULT_ITEMCOUNT
  } = params;
  const itemSizeGetterCalls: number[] = [];
  const sizeAndPositionManager = new SizeAndPositionManager({
    itemCount,
    itemSizeGetter: (index: number) => {
      itemSizeGetterCalls.push(index);
      return itemSize;
    },
    estimatedSizeGetter: () => estimatedSize
  });

  return {
    sizeAndPositionManager,
    itemSizeGetterCalls
  };
};

describe('SizeAndPositionManager', () => {
  describe('getSizeAndPositionForIndex', () => {
    it('should throw error when providing and unexpected index', () => {
      const { sizeAndPositionManager } = getSizeAndPositionManager();
      expect(() =>
        sizeAndPositionManager.getSizeAndPositionForIndex(-1)
      ).toThrow();
    });

    it('should throw error when providing and unexpected index (exceed the itemCount)', () => {
      const { sizeAndPositionManager } = getSizeAndPositionManager();
      expect(() =>
        sizeAndPositionManager.getSizeAndPositionForIndex(DEFAULT_ITEMCOUNT)
      ).toThrow();
    });

    it('should get correct size and offset', () => {
      const { sizeAndPositionManager } = getSizeAndPositionManager();

      expect(sizeAndPositionManager.getSizeAndPositionForIndex(0).size).toEqual(
        DEFAULT_ITEMSIZE
      );
      expect(
        sizeAndPositionManager.getSizeAndPositionForIndex(0).offset
      ).toEqual(0);
      expect(sizeAndPositionManager.getSizeAndPositionForIndex(4).size).toEqual(
        DEFAULT_ITEMSIZE
      );
      expect(
        sizeAndPositionManager.getSizeAndPositionForIndex(4).offset
      ).toEqual(4 * DEFAULT_ITEMSIZE);
    });

    it('should get expected cached index after get target index', () => {
      const {
        sizeAndPositionManager,
        itemSizeGetterCalls
      } = getSizeAndPositionManager();

      sizeAndPositionManager.getSizeAndPositionForIndex(4);

      expect(itemSizeGetterCalls).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('getUpdatedOffsetForIndex', () => {
    const CONTAINER_SIZE = 100;

    const config: Record<
      ALIGN,
      Array<{
        index: number;
        currentOffset: number;
        expectedOffset: number;
        description?: string;
      }>
    > = {
      auto: [
        {
          index: 0,
          currentOffset: 20,
          expectedOffset: 0
        },
        {
          index: 6,
          currentOffset: 0,
          expectedOffset:
            DEFAULT_ITEMSIZE * 6 + DEFAULT_ITEMSIZE - CONTAINER_SIZE,
          description: 'out of sight'
        }
      ],
      start: [
        {
          index: 0,
          currentOffset: 20,
          expectedOffset: 0
        },
        {
          index: 6,
          currentOffset: 0,
          expectedOffset: 6 * DEFAULT_ITEMSIZE,
          description: 'out of sight'
        }
      ],
      end: [
        {
          index: 0,
          currentOffset: 20,
          expectedOffset: 0
        },
        {
          index: 7,
          currentOffset: 0,
          expectedOffset:
            7 * DEFAULT_ITEMSIZE + DEFAULT_ITEMSIZE - CONTAINER_SIZE,
          description: 'out of sight'
        }
      ],
      center: [
        {
          index: 0,
          currentOffset: 20,
          expectedOffset: 0
        },
        {
          index: 10,
          currentOffset: 0,
          expectedOffset:
            10 * DEFAULT_ITEMSIZE - (CONTAINER_SIZE - DEFAULT_ITEMSIZE) / 2,
          description: 'out of sight'
        }
      ]
    };

    Object.keys(config).forEach(key => {
      const item = config[key as ALIGN];

      item.forEach(testObj => {
        it(`should get correct offset for align: ${key}${
          testObj.description ? ` ( ${testObj.description} )` : ''
        }`, () => {
          const { sizeAndPositionManager } = getSizeAndPositionManager();

          expect(
            sizeAndPositionManager.getUpdatedOffsetForIndex({
              align: key as ALIGN,
              targetIndex: testObj.index,
              currentOffset: testObj.currentOffset,
              containerSize: CONTAINER_SIZE
            })
          ).toEqual(testObj.expectedOffset);
        });
      });
    });
  });

  describe('getVisibleRange', () => {
    it('no range when container size is requal zero', () => {
      const { sizeAndPositionManager } = getSizeAndPositionManager({
        itemCount: 0
      });

      expect(
        sizeAndPositionManager.getVisibleRange({
          currentOffset: 0,
          containerSize: 100,
          overscan: 0
        })
      ).toEqual({});
    });

    it('should get correct range', () => {
      const { sizeAndPositionManager } = getSizeAndPositionManager();

      expect(
        sizeAndPositionManager.getVisibleRange({
          currentOffset: 100,
          containerSize: 100,
          overscan: 0
        })
      ).toEqual({
        start: 2,
        end: 3
      });
    });
  });

  describe('resetItem', () => {
    it('get correct lastMeasureIndex', () => {
      const { sizeAndPositionManager } = getSizeAndPositionManager();

      sizeAndPositionManager.getSizeAndPositionForIndex(2);

      expect(sizeAndPositionManager.getSizeAndPositionOfLastMeasured()).toEqual(
        {
          offset: 2 * DEFAULT_ITEMSIZE,
          size: DEFAULT_ITEMSIZE
        }
      );

      sizeAndPositionManager.resetItem(2);

      expect(sizeAndPositionManager.getSizeAndPositionOfLastMeasured()).toEqual(
        {
          offset: 1 * DEFAULT_ITEMSIZE,
          size: DEFAULT_ITEMSIZE
        }
      );
    });
  });

  describe('updateConfig', () => {
    it('get expected offset after updateConfig', () => {
      const { sizeAndPositionManager } = getSizeAndPositionManager();
      const updatedSize = 100;

      sizeAndPositionManager.updateConfig({
        itemSizeGetter: index => updatedSize
      });

      expect(sizeAndPositionManager.getSizeAndPositionForIndex(1)).toEqual({
        offset: updatedSize,
        size: updatedSize
      });
    });
  });
});
