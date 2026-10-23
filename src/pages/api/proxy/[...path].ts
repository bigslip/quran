/* eslint-disable react-func/max-lines-per-function */
import fs from 'fs';
import pathModule from 'path';

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
  const { path: queryPath } = req.query;
  const pathString = Array.isArray(queryPath) ? queryPath.join('/') : queryPath || req.url || '';

  // Handle binary SQLite downloads for mobile offline engines
  const downloadMatch = /(?:^|\/)download\/tafsirs\/([^/]+\.db)$/.exec(pathString);
  if (downloadMatch) {
    const fileName = pathModule.basename(downloadMatch[1]);
    const filePath = pathModule.join(process.cwd(), 'data/qdc/download/tafsirs', fileName);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      res.setHeader('Content-Type', 'application/x-sqlite3');
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      const fileStream = fs.createReadStream(filePath);
      return fileStream.pipe(res);
    }
    if (typeof res.redirect === 'function') {
      return res.redirect(307, `/data/qdc/download/tafsirs/${encodeURIComponent(fileName)}`);
    }
    return res.status(404).json({ error: 'Database not found' });
  }

  try {
    const data = await getLocalApiResponse(pathString, req.query);
    const isStaticQdcContent =
      pathString.includes('content/api/qdc/') &&
      !pathString.includes('/search') &&
      !pathString.includes('/navigate');
    if (isStaticQdcContent) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }
    return res.status(200).json(data);
  } catch (error: any) {
    console.error(`Local proxy error for ${pathString}:`, error?.message || error);
    return res
      .status(404)
      .json({ error: 'Resource not found', message: error?.message || 'Not found' });
  }
}
