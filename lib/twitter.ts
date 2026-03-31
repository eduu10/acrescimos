import crypto from 'crypto';
import { getSetting } from '@/lib/db';

interface TwitterCredentials {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
}

function oauthSign(
  method: string,
  url: string,
  params: Record<string, string>,
  creds: TwitterCredentials
): string {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');

  const base = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sorted),
  ].join('&');

  const signingKey = `${encodeURIComponent(creds.apiSecret)}&${encodeURIComponent(creds.accessSecret)}`;
  return crypto.createHmac('sha1', signingKey).update(base).digest('base64');
}

function buildAuthHeader(params: Record<string, string>): string {
  return (
    'OAuth ' +
    Object.keys(params)
      .filter(k => k.startsWith('oauth_'))
      .sort()
      .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(params[k])}"`)
      .join(', ')
  );
}

export async function postTweet(text: string): Promise<boolean> {
  try {
    const [apiKey, apiSecret, accessToken, accessSecret, enabled] = await Promise.all([
      getSetting('twitter_api_key'),
      getSetting('twitter_api_secret'),
      getSetting('twitter_access_token'),
      getSetting('twitter_access_secret'),
      getSetting('twitter_auto_post'),
    ]);

    if (!apiKey || !apiSecret || !accessToken || !accessSecret) return false;
    if (enabled !== 'true') return false;

    const creds: TwitterCredentials = { apiKey, apiSecret, accessToken, accessSecret };
    const url = 'https://api.twitter.com/2/tweets';
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = String(Math.floor(Date.now() / 1000));

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: creds.apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: creds.accessToken,
      oauth_version: '1.0',
    };

    const signature = oauthSign('POST', url, oauthParams, creds);
    const authHeader = buildAuthHeader({ ...oauthParams, oauth_signature: signature });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(8000),
    });

    return res.ok;
  } catch {
    return false;
  }
}

export function buildTweetText(title: string, slug: string): string {
  const articleUrl = `https://acrescimos.com.br/article/${slug}`;
  const hashtags = '\n\n#futebol #brasileirao #acrescimos';
  const maxTitleLength = 280 - articleUrl.length - hashtags.length - 4;
  const truncatedTitle = title.length > maxTitleLength
    ? title.slice(0, maxTitleLength - 3) + '...'
    : title;
  return `${truncatedTitle} ⚽\n\n${articleUrl}${hashtags}`;
}
