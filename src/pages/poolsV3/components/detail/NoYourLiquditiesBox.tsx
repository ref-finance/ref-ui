import React from 'react';
import { useHistory } from 'react-router';
import { TOKEN_LIST_FOR_RATE, get_pool_name } from '~services/commonV3';
import { GradientButton } from '~components/button/Button';
import { FormattedMessage, useIntl } from 'react-intl';
import { NoLiquidityIcon } from '../../../../components/icon/V3';

export function NoYourLiquditiesBox(props: any) {
  const { poolDetail } = props;
  const { token_x_metadata, pool_id } = poolDetail;
  const history = useHistory();
  function goAddLiqudityPage() {
    const [token_x, token_y, fee] = pool_id.split('|');
    let url_hash = pool_id;
    if (TOKEN_LIST_FOR_RATE.indexOf(token_x_metadata?.symbol) > -1) {
      url_hash = `${token_y}|${token_x}|${fee}`;
    }
    const pool_name = get_pool_name(url_hash);
    history.push(`/addLiquidityV2#${pool_name}`);
  }
  return (
    <div className="flex flex-col items-center px-10 py-6 bg-cardBg rounded-xl">
      <NoLiquidityIcon className="mt-6"></NoLiquidityIcon>
      <span className="text-sm text-v3SwapGray mt-5 mb-8">
        <FormattedMessage id="no_positons_in_this_pool_yet" />
      </span>
      <div className="flex justify-center w-full">
        <GradientButton
          onClick={(e) => {
            e.stopPropagation();
            goAddLiqudityPage();
          }}
          color="#fff"
          className={`w-full h-11 text-center text-base text-white focus:outline-none`}
        >
          <FormattedMessage id="add_liquidity"></FormattedMessage>
        </GradientButton>
      </div>
    </div>
  );
}
