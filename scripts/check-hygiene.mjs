import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { lstat } from 'node:fs/promises';
import { root } from './lib.mjs';

// Public browser acceptance source was authorized on 2026-10-29; compiler tests remain local.
const listing=spawnSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'});
assert.equal(listing.status,0,listing.stderr);
const paths=[...new Set(listing.stdout.split('\0').filter(Boolean))];
for(const path of paths) {
  assert.ok(!/^(?:dist|node_modules|\.local|docs|notes|reports|tmp)\//.test(path),`Local/generated content: ${path}`);
  assert.ok(!/(?:^|\/)(?:AGENTS|CLAUDE|REPOSITORIES)\.md$/.test(path),`Agent configuration: ${path}`);
  assert.ok(!/(?:^|\/)(?:\.env(?:\.(?!example$).*)?|id_rsa|id_ed25519)$/.test(path),`Private material: ${path}`);
  assert.ok(!path.startsWith('tests/')||path.startsWith('tests/browser/'),`Unapproved test scope: ${path}`);
  if(/\.(?:png|jpe?g|webp|gif|zip|gz|pdf|app|dmg|exe)$/i.test(path)) {
    assert.match(path,/^tests\/browser\/baselines\/[a-z-]+\.png$/,`Unreviewed binary: ${path}`);
  }
  assert.ok(!(await lstat(new URL(path,root))).isSymbolicLink(),`Unexpected symlink: ${path}`);
}
const whitespace=spawnSync('git',['diff','--check'],{cwd:root,encoding:'utf8'});
assert.equal(whitespace.status,0,whitespace.stdout+whitespace.stderr);
console.log(`Hygiene: ${paths.length} public files; local artifacts excluded.`);
