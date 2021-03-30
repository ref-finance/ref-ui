import React, { useEffect, useState } from 'react';
import { getTokenMetadata, TokenMetadata } from '../../services/token';

export default function Token({ id }: { id: string }) {
  const [metadata, setMetadata] = useState<TokenMetadata>();
  useEffect(() => {
    getTokenMetadata(id).then(setMetadata);
  }, []);

  return (
    <tr className="h-12 border-separate  border-b border-t border-borderGray">
      <td>
        <Link to={`/pools/${pool.id}`}>{pool.id}</Link>
      </td>
      <td>{pool.tokenIds.join(' / ')}</td>
    </tr>
  );
}
