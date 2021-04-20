import React from 'react';
import { useParams } from 'react-router';
import Loading from '../components/layout/Loading';
import PageWrap from '../components/layout/PageWrap';
import { useWhitelistTokens } from '../state/token';
import Register from '../components/management/Register';

export default function WhitelistTokenPage() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const whitelistedTokens = useWhitelistTokens();

  if (!whitelistedTokens) return <Loading />;

  const hasToken = whitelistedTokens.some((token) => token.id === tokenId);

  return (
    <PageWrap>
      {hasToken ? (
        <p className="text-center text-2xl text-inputText leading-tight">
          Token {tokenId} already in whitelist
        </p>
      ) : (
        <Register initialTokenId={tokenId} />
      )}
    </PageWrap>
  );
}
