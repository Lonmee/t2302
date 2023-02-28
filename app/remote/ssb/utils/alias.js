export function canonicalizeAliasURL(aliasURL) {
  return aliasURL.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
