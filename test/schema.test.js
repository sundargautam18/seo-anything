import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSchema, SUPPORTED_SCHEMAS } from '../src/schema-generator.js';

test('generateSchema generates valid schema for all supported types', () => {
  for (const type of SUPPORTED_SCHEMAS) {
    const res = generateSchema(type);
    assert.ok(res.object, `Schema object should exist for ${type}`);
    assert.equal(res.object['@context'], 'https://schema.org');
    assert.ok(res.json, `JSON string should exist for ${type}`);
    assert.ok(res.snippet.includes('<script type="application/ld+json">'));
  }
});

test('generateSchema customizes article metadata', () => {
  const custom = generateSchema('article', {
    headline: 'Custom Test Headline',
    authorName: 'Dr. Jane Smith',
  });
  assert.equal(custom.object.headline, 'Custom Test Headline');
  assert.equal(custom.object.author.name, 'Dr. Jane Smith');
});

test('generateSchema throws error on unknown schema type', () => {
  assert.throws(() => {
    generateSchema('non_existent_type');
  }, /Unsupported schema type/);
});
