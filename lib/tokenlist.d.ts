import { FungibleTokenMetadata } from '@tonic-foundation/token';
import { NearEnv } from '@tonic-foundation/config';
export interface TokenList {
    readonly name: string;
    readonly tags: {
        [tag: string]: TagDetails;
    };
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
export declare type BridgeType = 'rainbow' | 'allbridge';
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
export declare enum Strategy {
    GitHub = "GitHub",
    Static = "Static"
}
export declare class StaticTokenListResolutionStrategy {
    resolve: () => ({
        spec: string;
        name: string;
        symbol: string;
        reference: null;
        reference_hash: null;
        decimals: number;
        icon: string;
        address: string;
        nearEnv: string;
        logoURI: string;
        tags: never[];
        extensions: {
            website: string;
            explorer: string;
            bridgeType?: undefined;
            bridgeContract?: undefined;
        };
    } | {
        spec: string;
        name: string;
        symbol: string;
        reference: null;
        reference_hash: null;
        decimals: number;
        icon: string;
        address: string;
        nearEnv: string;
        tags: never[];
        extensions: {
            website: string;
            explorer: string;
            bridgeType?: undefined;
            bridgeContract?: undefined;
        };
        logoURI?: undefined;
    } | {
        spec: string;
        name: string;
        symbol: string;
        reference: string;
        reference_hash: null;
        decimals: number;
        icon: string;
        address: string;
        nearEnv: string;
        tags: never[];
        extensions: {
            website: string;
            explorer: string;
            bridgeType?: undefined;
            bridgeContract?: undefined;
        };
        logoURI?: undefined;
    } | {
        spec: string;
        name: string;
        symbol: string;
        reference: string;
        reference_hash: string;
        decimals: number;
        icon: string;
        address: string;
        nearEnv: string;
        logoURI: string;
        tags: never[];
        extensions: {
            website: string;
            explorer: string;
            bridgeType?: undefined;
            bridgeContract?: undefined;
        };
    } | {
        spec: string;
        name: string;
        symbol: string;
        reference: string;
        reference_hash: string;
        decimals: number;
        icon: string;
        address: string;
        nearEnv: string;
        tags: string[];
        extensions: {
            website: string;
            explorer: string;
            bridgeType: string;
            bridgeContract: string;
        };
        logoURI?: undefined;
    } | {
        spec: string;
        name: string;
        symbol: string;
        reference: string;
        reference_hash: string;
        decimals: number;
        icon: string;
        address: string;
        nearEnv: string;
        logoURI: string;
        tags: string[];
        extensions: {
            website: string;
            explorer: string;
            bridgeType: string;
            bridgeContract: string;
        };
    } | {
        spec: string;
        name: string;
        symbol: string;
        reference: null;
        reference_hash: null;
        decimals: number;
        icon: string;
        address: string;
        nearEnv: string;
        logoURI: string;
        tags: string[];
        extensions: {
            website: string;
            explorer: string;
            bridgeType: string;
            bridgeContract: string;
        };
    })[];
}
export declare class GitHubTokenListResolutionStrategy {
    repositories: string[];
    resolve: () => Promise<TokenInfo[]>;
}
export declare class TokenListProvider {
    static strategies: {
        Static: StaticTokenListResolutionStrategy;
        GitHub: StaticTokenListResolutionStrategy;
    };
    resolve: (strategy?: Strategy) => Promise<TokenListContainer>;
}
export declare class TokenListContainer {
    private tokenList;
    constructor(tokenList: TokenInfo[]);
    filterByTag: (tag: string) => TokenListContainer;
    filterByNearEnv: (nearEnv: NearEnv) => TokenListContainer;
    excludeByNearEnv: (nearEnv: NearEnv) => TokenListContainer;
    excludeByTag: (tag: string) => TokenListContainer;
    getList: () => TokenInfo[];
}
