import { FungibleTokenMetadata } from '@tonic-foundation/token';
import { NearEnv } from '@tonic-foundation/config';
import tokenlist from '../tokens/near.tokenlist.json';

export interface TokenList {
  readonly name: string;
  readonly tags: { [tag: string]: TagDetails };
  readonly timestamp: string;
  readonly tokens: TokenInfo[];
}

export interface TagDetails {
  readonly name: string;
  readonly description: string;
}

export interface TokenInfo extends FungibleTokenMetadata {
  readonly address: string;
  readonly nearEnv: NearEnv;
  readonly logoURI?: string;
  readonly tags?: string[];
  readonly extensions?: TokenExtensions;
}

export type BridgeType = 'rainbow' | 'allbridge';

export interface TokenExtensions {
  readonly bridgeType?: BridgeType;
  readonly website?: string;
  readonly bridgeContract?: string;
  readonly explorer?: string;
  readonly twitter?: string;
  readonly github?: string;
  readonly medium?: string;
  readonly tggroup?: string;
  readonly discord?: string;
  readonly tonicNearMarketId?: string;
  readonly coingeckoId?: string;
  readonly description?: string;
}

export enum Strategy {
  GitHub = 'GitHub',
  Static = 'Static',
}

const queryJsonFiles = async (files: string[]) => {
  const responses: TokenList[] = (await Promise.all(
    files.map(async (repo) => {
      try {
        const response = await fetch(repo);
        const json = (await response.json()) as TokenList;
        return json;
      } catch {
        console.info(
          `@tonic-foundation/token-list: falling back to static repository.`
        );
        return tokenlist;
      }
    })
  )) as TokenList[];

  return responses
    .map((tokenlist: TokenList) => tokenlist.tokens || [])
    .reduce((acc, arr) => (acc as TokenInfo[]).concat(arr), []);
};

export class StaticTokenListResolutionStrategy {
  resolve = () => {
    return tokenlist.tokens || [];
  };
}

export class GitHubTokenListResolutionStrategy {
  repositories = [
    'https://raw.githubusercontent.com/tonic-foundation/token-list/master/src/tokens/near.tokenlist.json',
  ];

  resolve = () => {
    return queryJsonFiles(this.repositories);
  };
}

export class TokenListProvider {
  static strategies = {
    [Strategy.Static]: new StaticTokenListResolutionStrategy(),
    [Strategy.GitHub]: new StaticTokenListResolutionStrategy(),
  };

  resolve = async (
    strategy: Strategy = Strategy.Static
  ): Promise<TokenListContainer> => {
    return new TokenListContainer(
      // @ts-ignore
      await TokenListProvider.strategies[strategy].resolve()
    );
  };
}

export class TokenListContainer {
  constructor(private tokenList: TokenInfo[]) {}

  filterByTag = (tag: string) => {
    return new TokenListContainer(
      this.tokenList.filter((item) => (item.tags || []).includes(tag))
    );
  };

  filterByNearEnv = (nearEnv: NearEnv) => {
    return new TokenListContainer(
      this.tokenList.filter((item) => item.nearEnv === nearEnv)
    );
  };

  excludeByNearEnv = (nearEnv: NearEnv) => {
    return new TokenListContainer(
      this.tokenList.filter((item) => item.nearEnv !== nearEnv)
    );
  };

  excludeByTag = (tag: string) => {
    return new TokenListContainer(
      this.tokenList.filter((item) => !(item.tags || []).includes(tag))
    );
  };

  getList = () => {
    return this.tokenList;
  };
}
