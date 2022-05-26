import { parse } from 'ts-command-line-args';
import { ftMetadata, FungibleTokenMetadata } from '@tonic-foundation/token';
import { getNearConfig, NearEnv } from '@tonic-foundation/config';
import { Near, keyStores } from 'near-api-js';
import { readFileSync, writeFileSync } from 'fs';

const tokenlistPath = 'src/tokens/near.tokenlist.json';

export interface TokenOptions {
  token_id: string;
  network: NearEnv
}

const addToList = (metadata: FungibleTokenMetadata) => {
  const file = readFileSync(tokenlistPath);
  const tokenlist = JSON.parse(file.toString());
  const tokens = tokenlist.tokens;
  const newList = {
    ...tokenlist,
    tokens: [
      ...tokens,
      metadata
    ]
  };
  writeFileSync(tokenlistPath, JSON.stringify(newList, null, 4));
};

const main = async () => {
  const args = parse<TokenOptions>({
    token_id: String,
    // @ts-ignore
    network: String
  });

  const near = new Near({ ...getNearConfig(args.network), keyStore: new keyStores.InMemoryKeyStore() });
  const account = await near.account('test');
  const metadata = await ftMetadata(account, args.token_id);
  console.log(metadata);
  addToList(metadata);
  console.log('successfully wrote token to token list');
};

main();