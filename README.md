# token-list

This is a fork of the popular [@solana-labs/token-list]() for NEAR/Aurora.

# Contents
* [Usage](#usage)
* [Adding new token](#adding-new-token)
* [Modifying existing token](#modifying-existing-token)
* [Common issues](#common-issues)
  * [Automerge failure: found removed line](#automerge-failure-found-removed-line)
  * [Failed to normalize: failed to parse JSON: json: unknown field](#failed-to-normalize-failed-to-parse-json-json-unknown-field)
  * [Duplicate token](#duplicate-token)
  * [Scanner/wallet hasn't updated yet](#scannerwallet-hasnt-updated-yet)
  * [error validating schema: chainId: conflicting values 103 and 0](#error-validating-schema-chainid-conflicting-values-103-and-0)
  * [warning about the last element in the list](#warning-about-the-last-element-in-the-list)
* [Disclaimer](#disclaimer)


# Usage

@tonic-foundation/token-list

[![npm](https://img.shields.io/npm/v/@solana/spl-token-registry)](https://unpkg.com/@solana/spl-token-registry@latest/) [![GitHub license](https://img.shields.io/badge/license-APACHE-blue.svg)](https://github.com/solana-labs/token-list/blob/b3fa86b3fdd9c817139e38641d46c5a892542a52/LICENSE)

@tonic-foundation/token-list is a package that allows application to query for list of tokens.
The JSON schema for the tokens includes: chainId, address, name, decimals, symbol, logoURI (optional), tags (optional), and custom extensions metadata.

The interface is nearly identical to [@solana-labs/token-list]() for ease of use. 

## Installation

```bash
npm install @tonic-foundation/token-list
```

```bash
yarn add @tonic-foundation/token-list
```

## Examples

### Query available tokens

```typescript
new TokenListProvider().resolve().then((tokens) => {
  const tokenList = tokens.filterByClusterSlug('mainnet-beta').getList();
  console.log(tokenList);
});
```

### Render icon for token in React

```typescript jsx
import React, { useEffect, useState } from 'react';
import { TokenListProvider, TokenInfo } from '@tonic-foundation/token-list';


export const Icon = (props: { mint: string }) => {
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());

  useEffect(() => {
    new TokenListProvider().resolve().then(tokens => {
      const tokenList = tokens.filterByChainId(ENV.MainnetBeta).getList();

      setTokenMap(tokenList.reduce((map, item) => {
        map.set(item.address, item);
        return map;
      },new Map()));
    });
  }, [setTokenMap]);

  const token = tokenMap.get(props.mint);
  if (!token || !token.logoURI) return null;

  return (<img src={token.logoURI} />);

```