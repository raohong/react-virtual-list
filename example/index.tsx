import React from 'react';
import { render } from 'react-dom';

import { VirtualList } from '../src/index';

const cardStyle: React.CSSProperties = {
  width: '100%',
  fontSize: 18,
  padding: 20,
  boxSizing: 'border-box',
  backgroundColor: '#f4f4f4',
  borderBottom: '10px solid #fff'
};

const App = () => {
  return (
    <div>
      <VirtualList
        itemCount={1000}
        dynamic
        itemSize={60}
        width='100%'
        height={window.innerHeight}
        renderItem={(i, style) => (
          <div
            key={i}
            style={{
              ...style,
              ...cardStyle
            }}
          >
            <h2>#{i}</h2>
            {i % 2 === 0 ? (
              <img
                src='https://i.loli.net/2019/12/17/wjGuVMaFylAQbi6.jpg'
                alt=''
              />
            ) : (
              <img
                alt=''
                src='https://i.loli.net/2019/12/17/eGUJnX3NhZ85xvj.png'
              />
            )}
          </div>
        )}
      />
    </div>
  );
};

render(<App />, document.querySelector('#app'));
