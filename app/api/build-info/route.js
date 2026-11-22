import {releaseInfo} from '../../lib/release-info.mjs';

// Endpoint somente leitura, público e intencionalmente sem identificadores de usuários.
export const runtime='nodejs';
export const dynamic='force-dynamic';

export function GET(){
  return Response.json(releaseInfo(process.env),{
    status:200,
    headers:{
      'Cache-Control':'no-store, max-age=0',
      'X-Robots-Tag':'noindex, nofollow',
      'X-Content-Type-Options':'nosniff',
    },
  });
}
