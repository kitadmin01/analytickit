import { test } from 'tap';

const importESM : (specifier : string) => Promise<any> =
  // eslint-disable-next-line no-eval
  eval('(specifier) => import(specifier)');

test('Piscina is default export', {}, async ({ equal }) => {
  equal((await importESM('@analytickit/piscina')).default, require('../'));
});

test('Exports match own property names', {}, async ({ strictSame }) => {
  // Check that version, workerData, etc. are re-exported.
  const exported = new Set(Object.getOwnPropertyNames(await importESM('@analytickit/piscina')));
  const required = new Set(Object.getOwnPropertyNames(require('../')));

  // Remove constructor properties + default export.
  for (const k of ['prototype', 'length', 'name']) required.delete(k);
  exported.delete('default');

  strictSame(exported, required);
});