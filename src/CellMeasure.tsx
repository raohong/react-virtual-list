import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { findDOMNode } from 'react-dom';

export interface ResizeEntryRect {
  width: number;
  height: number;
}

export interface CellMeasureProps {
  onResize?: (rect: ResizeEntryRect) => void;
  width: 'fixed' | number;
  height: 'fixed' | number;
}

export class CellMeasure extends React.PureComponent<CellMeasureProps> {
  private lastNode: HTMLElement | null = null;
  private ob: ResizeObserver | null = null;
  private lastSize: ResizeEntryRect = { width: -1, height: -1 };

  componentDidMount() {
    const { width, height } = this.props;
    const node = findDOMNode(this) as HTMLElement;

    if (width !== 'fixed') {
      this.lastSize.width = width;
    }

    if (height !== 'fixed') {
      this.lastSize.height = height;
    }

    if (node) {
      this.ob = new ResizeObserver(this.handleResize);
      this.ob.observe(node);
      this.lastNode = node;
    }
  }

  componentDidUpdate() {
    const node = findDOMNode(this) as HTMLElement;

    if (this.ob === null) {
      if (node !== null) {
        this.ob = new ResizeObserver(this.handleResize);
        this.ob.observe(node);

        this.lastNode = node;
      }

      return;
    } else {
      if (node === null) {
        this.ob.unobserve(this.lastNode!);
        this.lastNode = null;
        this.ob = null;
      } else if (this.lastNode && node !== this.lastNode) {
        this.ob.unobserve(this.lastNode);
        this.ob.observe(node);
        this.lastNode = node;
      }
    }
  }

  componentWillUnmount() {
    if (this.ob && this.lastNode) {
      this.ob.unobserve(this.lastNode);
    }
  }

  handleResize: ResizeObserverCallback = entry => {
    const { onResize, width, height } = this.props;
    if (typeof onResize === 'function') {
      const target = entry[0].target as HTMLElement;
      const w = target.offsetWidth;
      const h = target.offsetHeight;

      let flag = false;

      if (width !== 'fixed' && w !== this.lastSize.width) {
        flag = true;
        this.lastSize.width = w;
      }

      if (height !== 'fixed' && h !== this.lastSize.height) {
        flag = true;
        this.lastSize.height = h;
      }

      if (flag) {
        onResize({ ...this.lastSize });
      }
    }
  };

  render() {
    let children = React.Children.only(this.props.children);

    if (typeof children === 'string') {
      children = <span>{children}</span>;
    }

    return children;
  }
}
