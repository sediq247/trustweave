import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import http from 'node:http';
import { app, assessmentFor, qlooInsights, schema } from './server.js';

let server;
let origin;

function request(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(`${origin}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) } }, (res) => {
      let raw = '';
      res.setEncoding('utf8'); res.on('data', (part) => { raw += part; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(raw) }));
    });
    req.on('error', reject); req.end(data);
  });
}

beforeAll(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
afterAll(async () => new Promise((resolve) => server.close(resolve)));

describe('TrustWeave workflow', () => {
  it('validates brief sizes and allowed cultural entity types', () => {
    expect(schema.safeParse({ claim: 'A sufficiently detailed claim', audience: 'Families', objective: 'remind', culturalType: 'artist' }).success).toBe(true);
    expect(schema.safeParse({ claim: 'short', audience: 'Families', objective: 'remind' }).success).toBe(false);
    expect(schema.safeParse({ claim: 'A sufficiently detailed claim', audience: 'Families', objective: 'remind', culturalType: 'locality' }).success).toBe(false);
  });

  it('limits the supported assessment to the documented hand hygiene topic', () => {
    expect(assessmentFor('Washing hands with soap and water helps remove germs').label).toContain('Supported');
    expect(assessmentFor('This vaccine causes infertility').label).toBe('Not yet verified');
  });

  it('uses authenticated Qloo search and Insights requests and keeps only genre tags', async () => {
    process.env.QLOO_API_KEY = 'test-qloo-secret';
    const calls = [];
    vi.stubGlobal('fetch', async (url, options) => {
      calls.push({ url: String(url), headers: options.headers });
      if (String(url).includes('/search?')) return new Response(JSON.stringify({ results: { entities: [{ name: 'Sample Artist', entity_id: 'qloo-id-1', subtype: 'urn:entity:artist' }] } }), { status: 200 });
      return new Response(JSON.stringify({ results: { tags: [
        { name: 'Afrobeats', tag_id: 'urn:tag:genre:music:afrobeats', subtype: 'urn:tag:genre:music' },
        { name: 'Sensitive Topic', tag_id: 'urn:tag:keyword:music:example', subtype: 'urn:tag:keyword:music' }
      ] } }), { status: 200 });
    });
    const result = await qlooInsights('Sample Artist', 'artist');
    expect(calls).toHaveLength(2);
    expect(calls[0].headers['X-Api-Key']).toBe('test-qloo-secret');
    expect(calls[0].url).toContain('/search?');
    expect(calls[1].url).toContain('/v2/insights?');
    expect(result.signals.map((x) => x.name)).toEqual(['Afrobeats']);
    delete process.env.QLOO_API_KEY;
  });

  it('completes a live-shaped workflow with mocked CDC, Qloo, and Gemini services', async () => {
    process.env.QLOO_API_KEY = 'test-qloo-secret';
    process.env.GEMINI_API_KEY = 'test-gemini-secret';
    const network = [];
    vi.stubGlobal('fetch', async (url, options = {}) => {
      const target = String(url); network.push({ target, options });
      if (target.includes('cdc.gov')) return new Response('<html><h2>Do I really need to wash my hands for 20 seconds?</h2><p>Scientific studies show that you need to scrub for 20 seconds to remove harmful germs and chemicals from your hands.</p></html>', { status: 200, headers: { 'content-type': 'text/html' } });
      if (target.includes('/search?')) return new Response(JSON.stringify({ results: { entities: [{ name: 'Sample Artist', entity_id: 'qloo-id-1', subtype: 'urn:entity:artist' }] } }), { status: 200 });
      if (target.includes('/v2/insights?')) return new Response(JSON.stringify({ results: { tags: [{ name: 'Afrobeats', tag_id: 'urn:tag:genre:music:afrobeats', subtype: 'urn:tag:genre:music' }] } }), { status: 200 });
      const payload = JSON.parse(options.body);
      const review = payload.system_instruction.includes('independent quality reviewer');
      const answer = review ? JSON.stringify({ flags: [], notes: 'Human review is still required.' }) : JSON.stringify({ baseline: 'A calm evidence-based reminder for families.', adapted: 'A short rhythmic message for families.' });
      return new Response(JSON.stringify({ model: 'gemini-test-model', steps: [{ type: 'model_output', content: [{ type: 'text', text: answer }] }] }), { status: 200 });
    });
    const result = await request('/api/run', { claim: 'Washing hands with soap and water helps remove germs.', audience: 'Families', objective: 'remind', culturalSeed: 'Sample Artist', culturalType: 'artist', mode: 'live' });
    expect(result.status).toBe(200);
    expect(result.body.assessment.label).toContain('Supported');
    expect(result.body.culture.source).toBe('Live Qloo API response');
    expect(result.body.drafts.baseline).toContain('cdc.gov/clean-hands/faq/');
    expect(result.body.drafts.status).toBe('Human review required');
    expect(result.body.trace.map((x) => x.name)).toEqual(['Intake and triage', 'Evidence retrieval', 'Claim assessment', 'Qloo cultural analysis', 'Gemini message generation', 'Gemini quality review', 'Deterministic safety checks']);
    expect(network.some(({ options }) => options.headers?.['X-Api-Key'] === 'test-qloo-secret')).toBe(true);
    expect(network.some(({ options }) => options.headers?.['x-goog-api-key'] === 'test-gemini-secret')).toBe(true);
    expect(JSON.stringify(result.body)).not.toContain('test-gemini-secret');
    delete process.env.QLOO_API_KEY; delete process.env.GEMINI_API_KEY;
  });

  it('keeps sample mode separate and makes no Qloo or Gemini call', async () => {
    vi.stubGlobal('fetch', async (url) => {
      expect(String(url)).toContain('cdc.gov');
      return new Response('<h2>Do I really need to wash my hands for 20 seconds?</h2><p>Scientific studies show that you need to scrub for 20 seconds to remove harmful germs and chemicals.</p>', { status: 200 });
    });
    delete process.env.QLOO_API_KEY; delete process.env.GEMINI_API_KEY;
    const result = await request('/api/run', { claim: 'Washing hands with soap and water helps remove germs.', audience: 'Families', objective: 'remind', culturalSeed: 'Sample Artist', culturalType: 'artist', mode: 'sample' });
    expect(result.status).toBe(200);
    expect(result.body.culture.source).toContain('No Qloo request');
    expect(result.body.model).toContain('no Gemini call');
    expect(result.body.drafts.flags).toContain('Sample-only check. This is not a Gemini review.');
  });

  it('fails live Qloo cleanly when the provider key is absent', async () => {
    delete process.env.QLOO_API_KEY;
    await expect(qlooInsights('Sample Artist', 'artist')).rejects.toMatchObject({ status: 424 });
  });
});
