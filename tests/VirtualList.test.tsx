import React from 'react';
import { mount, ReactWrapper } from 'enzyme';

import { VirtualList } from '../src';
import { VirtualListProps, VirtualListState } from '../src/VirtualList';
import { DEFAULT_ITEMSIZE, ALIGN } from '../src/types';

const HEIGHT = 100;
const WIDTH = 100;

const callGetDerivedStateFromProps = (
  wrapper: ReactWrapper<VirtualListProps>,
  nextProps: Partial<VirtualListProps>
) => {
  const ret = wrapper
    .instance()
    // @ts-ignore
    .constructor.getDirivedStateFromProps(
      { ...wrapper.props(), ...nextProps },
      { ...wrapper.state() }
    );

  if (ret !== null) {
    wrapper.setState(ret);
  }
};

const getComponent = (props: Partial<VirtualListProps> = {}) => {
  const defaultProps: Partial<VirtualListProps> = {
    itemCount: 100,
    width: WIDTH,
    height: HEIGHT,
    overscan: 0,
    renderItem: (index, style) => (
      <div id={`item-${index}`} className='item' style={style} key={index}>
        #{index}
      </div>
    )
  };

  return mount<VirtualListProps, VirtualListState>(
    <VirtualList {...defaultProps} {...props} />
  );
};

describe('VirutaList', () => {
  it('set scrollOffset', () => {
    const virtualList = getComponent();

    expect(virtualList.find('#item-1').length).toEqual(1);

    callGetDerivedStateFromProps(virtualList, {
      scrollOffset: HEIGHT
    });

    expect(virtualList.find('#item-1').length).toEqual(0);
    expect(virtualList.find('#item-3').length).toEqual(1);
  });

  it('set scrollToIndex', () => {
    const virtualList = getComponent();

    expect(virtualList.find('#item-1').length).toEqual(1);

    callGetDerivedStateFromProps(virtualList, {
      scrollToIndex: 10,
      align: ALIGN.START
    });

    expect(virtualList.find('#item-1').length).toEqual(0);
    expect(virtualList.find('#item-10').length).toEqual(1);
    expect(virtualList.find('#item-11').length).toEqual(1);
  });

  it('handle scroll', () => {
    const onScroll = jest.fn();
    const virtualList = getComponent({
      className: 'virtual-list',
      onScroll
    });

    const node = virtualList.find('.virtual-list').at(0);
    const customEvent = new Event('scroll');

    node.getDOMNode().scrollTop = 1;
    node.getDOMNode().dispatchEvent(customEvent);
    expect(virtualList.prop('onScroll')).toHaveBeenCalled();

    virtualList.setState({
      offset: 200
    });
    expect(virtualList.find('#item-4').length).toEqual(1);
  });

  it('stickyIndices', () => {
    const stickyIndices = [6, 7, 8];
    const virtualList = getComponent({
      stickyIndices,
      renderItem: (index, style) => (
        <div
          key={index}
          style={style}
          className={
            stickyIndices.includes(index) ? 'item sticky' : 'normal item'
          }
        >
          #{index}
        </div>
      )
    });

    expect(virtualList.find('.sticky').length).toEqual(stickyIndices.length);
    expect(
      virtualList
        .find('.sticky')
        .at(0)
        .text()
    ).toContain(String(stickyIndices[0]));

    virtualList.setState({
      offset: virtualList
        .state('instanceProps')
        .sizeAndPositionManager.getSizeAndPositionForIndex(stickyIndices[0])
        .offset
    });
    expect(virtualList.find('.sticky').length).toEqual(stickyIndices.length);
    expect(virtualList.find('.normal').length).toEqual(0);
  });
});
