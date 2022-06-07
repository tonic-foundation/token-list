"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenListContainer = exports.TokenListProvider = exports.GitHubTokenListResolutionStrategy = exports.StaticTokenListResolutionStrategy = exports.Strategy = void 0;
const near_tokenlist_json_1 = __importDefault(require("./tokens/near.tokenlist.json"));
var Strategy;
(function (Strategy) {
    Strategy["GitHub"] = "GitHub";
    Strategy["Static"] = "Static";
})(Strategy = exports.Strategy || (exports.Strategy = {}));
const queryJsonFiles = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const responses = (yield Promise.all(files.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield fetch(repo);
            const json = (yield response.json());
            return json;
        }
        catch (_a) {
            console.info(`@tonic-foundation/token-list: falling back to static repository.`);
            return near_tokenlist_json_1.default;
        }
    }))));
    return responses
        .map((tokenlist) => tokenlist.tokens || [])
        .reduce((acc, arr) => acc.concat(arr), []);
});
class StaticTokenListResolutionStrategy {
    constructor() {
        this.resolve = () => {
            return near_tokenlist_json_1.default.tokens || [];
        };
    }
}
exports.StaticTokenListResolutionStrategy = StaticTokenListResolutionStrategy;
class GitHubTokenListResolutionStrategy {
    constructor() {
        this.repositories = [
            'https://raw.githubusercontent.com/tonic-foundation/token-list/master/src/tokens/near.tokenlist.json',
        ];
        this.resolve = () => {
            return queryJsonFiles(this.repositories);
        };
    }
}
exports.GitHubTokenListResolutionStrategy = GitHubTokenListResolutionStrategy;
class TokenListProvider {
    constructor() {
        this.resolve = (strategy = Strategy.Static) => __awaiter(this, void 0, void 0, function* () {
            return new TokenListContainer(
            // @ts-ignore
            yield TokenListProvider.strategies[strategy].resolve());
        });
    }
}
exports.TokenListProvider = TokenListProvider;
TokenListProvider.strategies = {
    [Strategy.Static]: new StaticTokenListResolutionStrategy(),
    [Strategy.GitHub]: new StaticTokenListResolutionStrategy(),
};
class TokenListContainer {
    constructor(tokenList) {
        this.tokenList = tokenList;
        this.filterByTag = (tag) => {
            return new TokenListContainer(this.tokenList.filter((item) => (item.tags || []).includes(tag)));
        };
        this.filterByNearEnv = (nearEnv) => {
            return new TokenListContainer(this.tokenList.filter((item) => item.nearEnv === nearEnv));
        };
        this.excludeByNearEnv = (nearEnv) => {
            return new TokenListContainer(this.tokenList.filter((item) => item.nearEnv !== nearEnv));
        };
        this.excludeByTag = (tag) => {
            return new TokenListContainer(this.tokenList.filter((item) => !(item.tags || []).includes(tag)));
        };
        this.getList = () => {
            return this.tokenList;
        };
    }
}
exports.TokenListContainer = TokenListContainer;
