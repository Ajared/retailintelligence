import { uploadRouter } from './core';
import { createRouteHandler } from 'uploadthing/next';

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});
