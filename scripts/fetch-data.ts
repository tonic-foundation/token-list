import { parse } from 'ts-command-line-args';
import { ftMetadata, FungibleTokenMetadata } from '@tonic-foundation/token';
import { getNearConfig, NearEnv } from '@tonic-foundation/config';
import { Near, keyStores } from 'near-api-js';
import { readFileSync, writeFileSync } from 'fs';
import { TokenExtensions, TokenInfo, TokenList } from '../src';

const TOKEN_LIST_PATH = 'src/tokens/near.tokenlist.json';
const BASE_IMAGE_URL =
  'https://raw.githubusercontent.com/tonic-foundation/token-list/master/images';

export interface TokenOptions {
  token_id: string;
  network: NearEnv;
  overwrite: boolean;
}

const getExplorerUrl = (nearEnv: NearEnv, address: string) => {
  if (nearEnv === 'mainnet') {
    return `https://nearblocks.io/address/${address}`;
  }
  return `https://testnet.nearblocks.io/address/${address}`;
};

const getBridgeInfo = (nearEnv: NearEnv, address: string): TokenExtensions => {
  if (nearEnv === 'mainnet') {
    if (address.includes('factory.bridge.near')) {
      return {
        bridgeType: 'rainbow',
        bridgeContract: 'factory.bridge.near',
      };
    }
    if (address.includes('token.a11bd.near')) {
      return {
        bridgeType: 'allbridge',
        bridgeContract: 'token.a11bd.near',
      };
    }
  }
  return {};
};

const saveBase64Image = (address: string, base64Img: string) => {
  const regex = /^data:.+\/(.+);base64,(.*)$/;
  const matches = base64Img.match(regex);
  if (!matches || matches.length < 3) {
    return;
  }
  let ext = matches[1];
  if (ext.startsWith('svg')) {
    ext = 'svg';
  }
  const data = matches[2];
  const filename = `${address}.${ext}`;
  const path = `images/${filename}`;
  const image = Buffer.from(data, 'base64');
  writeFileSync(path, image);
  return filename;
};

const saveSvg = (address: string, svg: string) => {
  const startIdx = svg.indexOf(',') + 1;
  const data = decodeURI(svg.substring(startIdx).replace(/%23/g, '#'));
  const filename = `${address}.svg`;
  const path = `images/${filename}`;
  writeFileSync(path, data);
  return filename;
};

const saveImage = (address: string, image: string) => {
  if (
    image.startsWith('data:image/svg+xml,') ||
    image.startsWith('data:image/svg,')
  ) {
    return saveSvg(address, image);
  } else {
    return saveBase64Image(address, image);
  }
};

const addToList = (
  address: string,
  nearEnv: NearEnv,
  metadata: FungibleTokenMetadata,
  overwrite: boolean = false
) => {
  const file = readFileSync(TOKEN_LIST_PATH);
  const tokenlist = JSON.parse(file.toString()) as TokenList;
  let tokens = tokenlist.tokens;
  if (tokens.find((t) => t.address === address)) {
    if (!overwrite) {
      console.log(`${address} already exists in token list`);
      return;
    }
    tokens = tokens.filter(t => t.address !== address);
  }
  const bridgeInfo = getBridgeInfo(nearEnv, address);
  const { icon, ...metadataWithoutIcon } = metadata;
  const tags = bridgeInfo?.bridgeType ? [bridgeInfo.bridgeType] : [];
  let logoURI = undefined;
  if (icon?.startsWith('https')) {
    logoURI = icon;
  } else if (icon) {
    const filename = saveImage(address, icon || '');
    if (filename) {
      logoURI = `${BASE_IMAGE_URL}/${filename}`;
    }
  }
  const tokenInfo: TokenInfo = {
    ...metadataWithoutIcon,
    icon: '',
    address,
    nearEnv,
    logoURI,
    tags,
    extensions: {
      website: '',
      explorer: getExplorerUrl(nearEnv, address),
      ...bridgeInfo,
    },
  };
  const newList: TokenList = {
    ...tokenlist,
    timestamp: new Date().toUTCString(),
    tokens: [...tokens, tokenInfo],
  };
  writeFileSync(TOKEN_LIST_PATH, JSON.stringify(newList, null, 4));
  console.log('successfully wrote token to token list');
};

const main = async () => {
  const args = parse<TokenOptions>({
    // @ts-ignore
    token_id: String,
    // @ts-ignore
    network: String,
    overwrite: Boolean,
  });

  const near = new Near({
    ...getNearConfig(args.network),
    keyStore: new keyStores.InMemoryKeyStore(),
  });
  const account = await near.account('');
  const metadata = await ftMetadata(account, args.token_id);
  addToList(args.token_id, args.network, metadata, args.overwrite);
};

main();
