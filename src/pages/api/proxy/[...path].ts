import type { NextApiRequest, NextApiResponse } from 'next';

import { getLocalApiResponse } from '@/utils/localDataEngine';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
    responseLimit: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || req.url || '';

  try {
    const data = await getLocalApiResponse(pathString, req.query);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).json(data);
  } catch (error: any) {
    console.error(`Local proxy error for ${pathString}:`, error?.message || error);
    return res.status(404).json({ error: 'Resource not found', message: error?.message || 'Not found' });
  }
}


