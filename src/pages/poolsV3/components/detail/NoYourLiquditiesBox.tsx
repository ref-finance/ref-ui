import React from 'react';
import { useHistory } from 'react-router';
import { get_pool_name, sort_tokens_by_base } from 'src/services/commonV3';
import { GradientButton } from 'src/components/button/Button';
import { FormattedMessage } from 'react-intl';
import { NoLiquidityIcon } from '../../../../components/icon/V3';

export function NoYourLiquditiesBox(props: any) {
  const { poolDetail } = props;
  const { pool_id } = poolDetail;
  const history = useHistory();
  function goAddLiqudityPage() {
    const [token_x, token_y, fee] = pool_id.split('|');
    let url_hash = pool_id;
    if (!is_reverse_fun()) {
      url_hash = `${token_y}|${token_x}|${fee}`;
    }
    const pool_name = get_pool_name(url_hash);
    history.push(`/addLiquidityV2#${pool_name}`);
  }
  function is_reverse_fun() {
    const { token_x_metadata, token_y_metadata } = poolDetail;
    if (token_x_metadata && token_y_metadata) {
      const tokens = sort_tokens_by_base([token_x_metadata, token_y_metadata]);
      return tokens[0].id !== token_x_metadata.id;
    }
    return false;
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
