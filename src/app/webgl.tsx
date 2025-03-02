import React from 'react';
import fs from 'fs';
import path from 'path';

const index = fs.readFileSync(path.join(process.cwd(), 'public/webgl-build/index.html'), 'utf-8');

const WebGLPage = () => {
  return (
    index
  );
};

export default WebGLPage; 