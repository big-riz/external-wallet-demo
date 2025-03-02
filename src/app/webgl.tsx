import React from 'react';
import index from './webgl-build/index.html';
const WebGLPage = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: index }} />
  );
};

export default WebGLPage; 