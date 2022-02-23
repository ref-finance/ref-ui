import React, { useState, useEffect, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  RiskLogo,
  ExternalLinkIcon,
  ShapeTitleIcon,
} from '~components/icon/Risk';

export default function RiskPage() {
  const intl = useIntl();
  const local = localStorage.getItem('local') || navigator.language;
  return (
    <div className="w-1/2 mx-auto pt-24 relative xs:w-11/12 md:w-11/12">
      <div className="flex justify-center absolute -top-16 left-1/2 transform -translate-x-1/2">
        <RiskLogo></RiskLogo>
      </div>
      <div className="flex justify-center text-white font-medium text-2xl whitespace-nowrap">
        {local == 'zh-CN' ? (
          <>
            <LangMessage id="of_using_ref_finance" />
            <label className="text-greenColor">
              <LangMessage id="risks" />
            </label>
          </>
        ) : (
          <>
            <label className="text-greenColor">
              <LangMessage id="risks" />
            </label>
            &nbsp;
            <LangMessage id="of_using_ref_finance" />
          </>
        )}
      </div>
      <div className="text-riskTextColor text-sm mt-3">
        <LangMessage id="introduction" />
      </div>
      <div className="flex justify-center items-center mt-5">
        <div
          onClick={() => {
            window.open(
              'https://form.typeform.com/to/EPmUetxU?typeform-source=mzko2gfnij6.typeform.com'
            );
          }}
          className="flex justify-between items-center w-48 bg-cardBg rounded-lg px-2.5 py-1.5 text-sm text-riskTextColor cursor-pointer hover:text-white mr-2.5"
        >
          <LangMessage id="general_risks_quiz" />
          <ExternalLinkIcon></ExternalLinkIcon>
        </div>
        <div
          onClick={() => {
            window.open('https://uniswap.org/whitepaper.pdf');
          }}
          className="flex justify-between items-center w-48 bg-cardBg rounded-lg px-2.5 py-1.5 text-sm text-riskTextColor cursor-pointer hover:text-white"
        >
          <LangMessage id="amm_core_design" />
          <ExternalLinkIcon></ExternalLinkIcon>
        </div>
      </div>
      <div className="mt-7">
        <ModuleTemplate title={langFunction('audits')}>
          <p className="text-sm text-riskTextColor mb-4">
            {local == 'zh-CN' ? (
              <>
                <label
                  className="underline cursor-pointer text-riskTextColor hover:text-white"
                  onClick={() => {
                    window.open('https://jitadigital.com/');
                  }}
                >
                  Jita
                </label>{' '}
                正在审核 Ref Finance 智能合约。 一旦第一次审计完成，Ref Finance
                将积极寻求第二次独立审计。
              </>
            ) : local == 'vi' ? (
              <>
                Smart contracts của Ref.finance hiện đang được kiểm định bởi{' '}
                <label
                  className="underline cursor-pointer text-riskTextColor hover:text-white"
                  onClick={() => {
                    window.open('https://jitadigital.com/');
                  }}
                >
                  Jita
                </label>
                . chúng tôi sẽ tích cực tìm kiếm thêm một bên thẩm định thứ 3
                nữa ngay sau khi lần kiểm định với Jita kết thúc.
              </>
            ) : (
              <>
                Ref Finance smart contracts are being audited by{' '}
                <label
                  className="underline cursor-pointer text-riskTextColor hover:text-white"
                  onClick={() => {
                    window.open('https://jitadigital.com/');
                  }}
                >
                  Jita
                </label>
                . Ref Finance will actively look for a second independant audit
                once the first audit is completed.
              </>
            )}
          </p>
          <p className="text-sm text-riskTextColor">
            <LangMessage id="audits_paragraph_2" />
          </p>
        </ModuleTemplate>
        <ModuleTemplate title={langFunction('admin_keys')}>
          <p className="text-sm text-riskTextColor mb-4">
            {local == 'zh-CN' ? (
              <>
                Ref Finance 由{' '}
                <label
                  onClick={() => {
                    window.open(
                      'https://app.astrodao.com/dao/ref-finance.sputnik-dao.near'
                    );
                  }}
                  className="underline text-riskTextColor hover:text-white cursor-pointer"
                >
                  Ref Finance Sputnik DAO
                </label>{' '}
                管理。有
                <label
                  className="underline text-riskTextColor hover:text-white cursor-pointer"
                  onClick={() => {
                    window.open(
                      'https://gov.ref.finance/t/introducing-the-guardians/253'
                    );
                  }}
                >
                  监护人
                </label>
                ，特定的 NEAR 地址，可以暂停合约。 只有 DAO 可以随时恢复合约。
              </>
            ) : local == 'vi' ? (
              <>
                Ref finance được quản trị bởi{' '}
                <label
                  onClick={() => {
                    window.open(
                      'https://app.astrodao.com/dao/ref-finance.sputnik-dao.near'
                    );
                  }}
                  className="underline text-riskTextColor hover:text-white cursor-pointer"
                >
                  Ref Finance Sputnik DAO.{' '}
                </label>
                Thêm vào đó, sẽ có những địa chỉ ví NEAR nhất định{' '}
                <label
                  className="underline text-riskTextColor hover:text-white cursor-pointer"
                  onClick={() => {
                    window.open(
                      'https://gov.ref.finance/t/introducing-the-guardians/253'
                    );
                  }}
                >
                  (được gọi là Guardians){' '}
                </label>
                có khả năng dừng contract của Ref.finance lại. Trong trường họp
                contract bị ngưng lại, chỉ có Ref.finance DAO mới có khả năng mở
                lại contract
              </>
            ) : (
              <>
                Ref Finance is managed by the{' '}
                <label
                  onClick={() => {
                    window.open(
                      'https://app.astrodao.com/dao/ref-finance.sputnik-dao.near'
                    );
                  }}
                  className="underline text-riskTextColor hover:text-white cursor-pointer"
                >
                  Ref Finance Sputnik DAO
                </label>
                . There are{' '}
                <label
                  className="underline text-riskTextColor hover:text-white cursor-pointer"
                  onClick={() => {
                    window.open(
                      'https://gov.ref.finance/t/introducing-the-guardians/253'
                    );
                  }}
                >
                  Guardians
                </label>
                , specific NEAR addresses, which are able to pause the contract.
                Only the DAO can resume the contract, at any time.
              </>
            )}
          </p>
          <p className="text-sm text-riskTextColor mb-4">
            <LangMessage id="admin_keys_paragraph_2" />
          </p>
          <p className="text-sm text-riskTextColor">
            <LangMessage id="admin_keys_paragraph_3" />
          </p>
          <div className="mt-6">
            <table className="table-fixed">
              <thead className="bg-black bg-opacity-20">
                <tr className="text-sm text-riskTextColor text-left">
                  <th className="bg-black bg-opacity-25 rounded-tl-lg py-2.5 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="address" />
                  </th>
                  <th className="bg-black bg-opacity-25 py-2.5 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="type" />
                  </th>
                  <th className="bg-black bg-opacity-25 rounded-tr-lg py-2.5 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="mission" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-black bg-opacity-20">
                <tr className="text-xs text-riskTextColor border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
                  <td width="30%" className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    v2.ref-finance.near
                  </td>
                  <td width="30%" className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="exchange_contract" />
                  </td>
                  <td width="40%" className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="table_body_tr_1" />
                  </td>
                </tr>
                <tr className="text-xs text-riskTextColor border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    v2.ref-farming.near
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="farming_contract" />
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="table_body_tr_2" />
                  </td>
                </tr>
                <tr className="text-xs text-riskTextColor border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    xtoken.ref-finance.near
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="staking_contract" />
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="table_body_tr_3" />
                  </td>
                </tr>
                <tr className="text-xs text-riskTextColor border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    ref-finance.sputnik-dao.near
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="sputnik_dao_contract" />
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="table_body_tr_4" />
                  </td>
                </tr>
                <tr className="text-xs text-riskTextColor border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    ref-community-board.sputnik-dao.near
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="sputnik_dao_contract" />
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="table_body_tr_5" />
                  </td>
                </tr>
                <tr className="text-xs text-riskTextColor border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    dao.ref-dev-team.near
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="sputnik_dao_contract" />
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="table_body_tr_6" />
                  </td>
                </tr>
                <tr className="text-xs text-riskTextColor border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    ref.ref-dev-fund.near
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="vesting_contract" />
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="table_body_tr_7" />
                  </td>
                </tr>
                <tr className="text-xs text-riskTextColor border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    s01.ref-airdrop.near
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="airdrop_contract" />
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="table_body_tr_8" />
                  </td>
                </tr>
                <tr className="text-xs text-riskTextColor border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    ref-bug-bounty-1.near{' '}
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="near_address" />
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="table_body_tr_9" />
                  </td>
                </tr>
                <tr className="text-xs text-riskTextColor bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5 rounded-bl-lg">
                    token.v2.ref-finance.near{' '}
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="fungible_token_contract" />
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5 rounded-br-lg">
                    <LangMessage id="table_body_tr_10" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ModuleTemplate>
        <ModuleTemplate title={langFunction('rug_pull')}>
          <p className="text-sm text-riskTextColor mb-4">
            <LangMessage id="rug_pull_paragraph_1" />
          </p>
          <p className="text-sm text-riskTextColor mb-4">
            <LangMessage id="rug_pull_paragraph_2" />{' '}
          </p>
          <p className="text-sm text-riskTextColor">
            <LangMessage id="rug_pull_paragraph_3" />
          </p>
        </ModuleTemplate>
        <ModuleTemplate title={langFunction('divergence_loss')}>
          <p className="text-sm text-riskTextColor mb-4">
            <LangMessage id="divergence_loss_paragraph_1" />
          </p>
          <p className="text-sm text-riskTextColor mb-4">
            <LangMessage id="divergence_loss_paragraph_2" />
          </p>
          <div className="overflow-hidden">
            <p
              className="flex items-center text-sm text-riskTextColor mb-4 cursor-pointer float-left hover:text-white"
              onClick={() => {
                window.open(
                  'https://pintail.medium.com/uniswap-a-good-deal-for-liquidity-providers-104c0b6816f2'
                );
              }}
            >
              <LangMessage id="divergence_loss_paragraph_3" />
              <ExternalLinkIcon className="ml-2"></ExternalLinkIcon>
            </p>
          </div>
        </ModuleTemplate>
        <ModuleTemplate title={langFunction('staking_risks')}>
          <p className="text-sm text-riskTextColor">
            <LangMessage id="staking_risks_paragraph_1" />
          </p>
        </ModuleTemplate>
        <ModuleTemplate title={langFunction('permanent_loss_of_a_peg')}>
          <p className="text-sm text-riskTextColor">
            <LangMessage id="permanent_loss_of_a_peg_paragraph_1" />
          </p>
        </ModuleTemplate>
        <ModuleTemplate title={langFunction('systemic_issues')}>
          <p className="text-sm text-riskTextColor mb-4">
            <LangMessage id="systemic_issues_paragraph_1" />
          </p>
          <p className="text-sm text-riskTextColor mb-4">
            <LangMessage id="systemic_issues_paragraph_2" />
          </p>
          <p className="text-sm text-riskTextColor mb-4">
            <LangMessage id="systemic_issues_paragraph_3" />
          </p>
          <p className="text-sm text-riskTextColor">
            - <LangMessage id="systemic_issues_paragraph_4" />
          </p>
          <p className="text-sm text-riskTextColor">
            - <LangMessage id="systemic_issues_paragraph_5" />
          </p>
          <p className="text-sm text-riskTextColor">
            - <LangMessage id="systemic_issues_paragraph_6" />
          </p>
          <p className="text-sm text-riskTextColor">
            - <LangMessage id="systemic_issues_paragraph_7" />
          </p>
        </ModuleTemplate>
        <ModuleTemplate title={langFunction('crypto_trading_addiction')}>
          <p className="text-sm text-riskTextColor mb-4">
            <LangMessage id="crypto_trading_addiction_paragraph_1" />
          </p>
          <p className="text-sm text-riskTextColor mb-4">
            <LangMessage id="crypto_trading_addiction_paragraph_2" />{' '}
          </p>
          <div className="overflow-hidden">
            <p
              onClick={() => {
                window.open(
                  'https://www.theguardian.com/technology/2022/jan/15/trading-is-gambling-no-doubt-about-it-how-cryptocurrency-dealing-fuels-addiction'
                );
              }}
              className="flex items-center hover:text-white cursor-pointer text-sm text-riskTextColor mb-4 float-left"
            >
              <LangMessage id="crypto_trading_addiction_paragraph_3" />
              <ExternalLinkIcon className="ml-2 flex-shrink-0"></ExternalLinkIcon>
            </p>
          </div>
          <div className="overflow-hidden">
            <p
              onClick={() => {
                window.open(
                  'https://www.vice.com/en/article/bvzz9a/i-lost-half-a-million-pounds-bitcoin'
                );
              }}
              className="flex items-center cursor-pointer text-sm text-riskTextColor hover:text-white mb-4 float-left"
            >
              <LangMessage id="crypto_trading_addiction_paragraph_4" />
              <ExternalLinkIcon className="ml-2 flex-shrink-0"></ExternalLinkIcon>
            </p>
          </div>
          <div className="overflow-hidden">
            <p
              onClick={() => {
                window.open(
                  'https://www.vice.com/en/article/8xe8jv/cryptocurrency-trading-addiction-gambling-castle-craig'
                );
              }}
              className="flex items-center cursor-pointer text-sm hover:text-white text-riskTextColor mb-4 float-left"
            >
              <LangMessage id="crypto_trading_addiction_paragraph_5" />
              <ExternalLinkIcon className="ml-2 flex-shrink-0"></ExternalLinkIcon>
            </p>
          </div>
          <div className="overflow-hidden">
            <p
              onClick={() => {
                window.open('https://www.bbc.co.uk/news/uk-scotland-57268024');
              }}
              className="flex items-center cursor-pointer text-sm text-riskTextColor float-left hover:text-white"
            >
              <LangMessage id="crypto_trading_addiction_paragraph_6" />
              <ExternalLinkIcon className="ml-2 flex-shrink-0"></ExternalLinkIcon>
            </p>
          </div>
        </ModuleTemplate>
      </div>
    </div>
  );
}

const ModuleTemplate = (props: any) => {
  const { title, children } = props;
  return (
    <div className="mb-5">
      <div className="relative">
        <ShapeTitleIcon></ShapeTitleIcon>
        <label className="text-chartBg text-lg font-medium absolute left-7 top-1.5">
          {title}
        </label>
      </div>
      <div className="bg-cardBg rounded-2xl px-7 py-5 relative -top-5 z-10 xs:px-5 md:px-5">
        {children}
      </div>
    </div>
  );
};

const en_US = {
  risks: 'Risks',
  of_using_ref_finance: 'of Using Ref. finance',
  introduction:
    'Providing liquidity and/or trading on Ref Finance do not come without risks. Before interacting with the protocol, please do research and understand the risks involved.',
  general_risks_quiz: 'General Risks Quiz',
  amm_core_design: 'AMM Core Design',
  audits: 'Audits',
  audits_paragraph_2:
    'Security audits do not eliminate risks completely. Please do not supply your life savings, or assets you cannot afford to lose, to Ref Finance, especially as a liquidity provider.',
  admin_keys: 'Admin keys',
  admin_keys_paragraph_2:
    'The current DAO has 26 members. Ref Finance will be transitioning to a fully decentralized DAO.',
  admin_keys_paragraph_3:
    'Please find below the list of contracts and addresses that have directly managed or currently manage the affairs of Ref Finance.',
  address: 'Address',
  type: 'Type',
  mission: 'Mission',
  exchange_contract: 'Exchange Contract',
  table_body_tr_1:
    'Manage the Automated Market Maker functions; Swap and Provide Liquidity',
  farming_contract: 'Farming Contract',
  table_body_tr_2: 'Manage liquidity incentives',
  staking_contract: 'Staking Contract',
  table_body_tr_3: 'Mint and burn xREF, and Distribute time-based rewards',
  sputnik_dao_contract: 'Sputnik DAO Contract',
  table_body_tr_4:
    'Ensure the success of Ref by taking strategic decisions (incl. smart contract amendments)',
  table_body_tr_5:
    'Manage and allocate funds to specific community contributors',
  table_body_tr_6: 'Execute the Strategy and Roadmap',
  vesting_contract: 'Vesting Contract',
  table_body_tr_7: 'Manage REF vesting contracts of Dev DAO members',
  airdrop_contract: 'Airdrop Contract',
  table_body_tr_8: 'Manage first REF airdrop',
  near_address: 'NEAR Address',
  table_body_tr_9: 'Manage one-time bug bounty payments',
  fungible_token_contract: 'Fungible Token Contract',
  table_body_tr_10: 'Mint REF token',
  rug_pull: 'Rug pull',
  rug_pull_paragraph_1:
    'If the team behind a token, either whitelisted or not, decides to abandon its project and takes the investors’ money, the project’s token will probably be worth $0.',
  rug_pull_paragraph_2:
    'If the token is whitelisted on Ref Finance, that does not mean the project will succeed. You are responsible for doing your own due diligence of the project and should understand that crypto are very-high risk, speculative investments.',
  rug_pull_paragraph_3:
    'You should be aware and prepared to potentially lose some or all of the money invested.',
  divergence_loss: 'Divergence Loss',
  divergence_loss_paragraph_1:
    'If you provide liquidity, please do note that you can make more money by not providing liquidity.',
  divergence_loss_paragraph_2:
    'Divergence Loss is often yet inappropriately called “impermanent loss”. The adjective (impermanent) may assume or create the marketing feeling that losses are only impermanent, meaning that losses are guaranteed to be reversed, which is not true.',
  divergence_loss_paragraph_3: 'Learn more about Divergence Loss',
  staking_risks: 'Staking risks',
  staking_risks_paragraph_1:
    'When staking you use multiple smart contract products each of which has its own risks.',
  permanent_loss_of_a_peg: 'Permanent loss of a peg',
  permanent_loss_of_a_peg_paragraph_1:
    'If one of the stablecoins in the pool goes significantly down below the peg of 1.0 and never returns to the peg, it will effectively mean that pool liquidity providers hold almost all their liquidity in that currency.',
  systemic_issues: 'Systemic issues',
  systemic_issues_paragraph_1:
    'In general, DeFi or the legos of money is highly connected, meaning that one failure of its component may trigger a succession of failures.',
  systemic_issues_paragraph_2:
    'A systematic risk means that you can lose money even if the failure does not directly concern your investment/exposure.',
  systemic_issues_paragraph_3:
    'The following risks may have an impact in the liquidity pools:',
  systemic_issues_paragraph_4: 'Smart contract issues with lending protocols',
  systemic_issues_paragraph_5: 'Smart contracts issues with staking protocols',
  systemic_issues_paragraph_6:
    'Systemic issues with the stablecoins in those pools',
  systemic_issues_paragraph_7:
    'Systemic issues with ERC20-native tokens in those pools',
  crypto_trading_addiction: 'Crypto trading addiction',
  crypto_trading_addiction_paragraph_1:
    'Trading crypto can be very addictive and, according to many sources, be a form of gambling addiction, which can destroy lives.',
  crypto_trading_addiction_paragraph_2:
    'Please find below a collection of stories relating to that matter.',
  crypto_trading_addiction_paragraph_3:
    "'Trading is gambling, no doubt about it'",
  crypto_trading_addiction_paragraph_4:
    "'I Lost Half a Million Pounds Trading Bitcoin'",
  crypto_trading_addiction_paragraph_5:
    "'We Spoke to a Therapist Who Treats Cryptocurrency Trading Addiction'",
  crypto_trading_addiction_paragraph_6:
    "'I lost millions through cryptocurrency trading addiction'",
};
const vi = {
  risks: 'Rủi ro',
  of_using_ref_finance: 'khi sử dụng Ref Finance',
  introduction:
    'Cung cấp thanh khoản và/hoặc trading/giao dịch trên Ref.finance sẽ không thể có chuyện không có rủi ro. Trước khi tương tác với giao thức, vui lòng tìm hiểu kĩ những rủi ro đi kèm.',
  general_risks_quiz: 'Quiz Test cơ bản',
  amm_core_design: 'Thiết kế AMM',
  audits: 'Kiểm định',
  audits_paragraph_2:
    'Những cuộc kiểm định không thể loại trừ hết rủi ro bảo mật. Vì lẽ đó, xin đừng cung cấp tiền tiết kiệm , hay bất cứ loại tài sản nào mà bạn không thể mất, đặc biệt khi bạn là một người cung cấp thanh khoản.',
  admin_keys: 'Khóa quản trị',
  admin_keys_paragraph_2:
    'HIện tại Ref.finance DAO đang có 26 thành viên. Trong tương lai, chúng tôi sẽ chuyển đổi thành 1 DAO hoàn toàn phi tập trung.',
  admin_keys_paragraph_3:
    'Dưới đây là một số các contracts và địa chỉ ví có tác động trực tiếp đến các vấn đề quản trị, hoặc hiện đang quản trị Ref.finance.',
  address: 'Địa chỉ',
  type: 'Loại',
  mission: 'Nhiệm vụ',
  exchange_contract: 'Exchange Contract',
  table_body_tr_1:
    'Quản lý các chức năng của AMM, cững như việc giao dịch và cung cấp thanh khoản',
  farming_contract: 'Farming Contract',
  table_body_tr_2: 'Quản lý các phần thưởng thanh khoản',
  staking_contract: 'Staking Contract',
  table_body_tr_3:
    'Tạo thêm/ đốt bỏ xRef, cùng với đó là phân phối phần thưởng theo chu kì',
  sputnik_dao_contract: 'Sputnik DAO Contract',
  table_body_tr_4:
    'Đảm bảo cho sự thành công của Ref bằng cách đưa ra những quyết định mang tính chiến lược',
  table_body_tr_5:
    'Quản trị và phân bổ vốn đến những   cộng tác viên trong  cộng đồng',
  table_body_tr_6: 'Thực hiện theo chiến lược và roadmap',
  vesting_contract: 'Vesting Contract',
  table_body_tr_7: 'Quản lý REF vesting contracts của cộng đồng DAO',
  airdrop_contract: 'Airdrop Contract',
  table_body_tr_8: 'Quản trị lần airdrop đầu của REF',
  near_address: 'Địa chỉ ví NEAR',
  table_body_tr_9: 'Quản trị những lần chi-trả-1-lần cho bug bounty',
  fungible_token_contract: 'Fungible Token Contract',
  table_body_tr_10: 'Tạo thêm Ref token',
  rug_pull: 'Rug pull',
  rug_pull_paragraph_1:
    'Nếu đội ngũ đứng sau token quyết định bỏ rơi dự án và rời đi với tiền của nhà đầu tư thì gần như chắc chắn là token của dự án sẽ rơi về $0  (mặc cho dự án có được whitelist bởi Ref. hay không).',
  rug_pull_paragraph_2:
    'Việc một token được whitelist bởi Ref.finance không đảm bảo là dự án sẽ thành công. Nhà đầu tư khi trước khi đặt tiền cho 1 đồng token nào đó nên hiểu rõ rằng thị trường tiền số là một thị trường rủi ro rất cao.',
  rug_pull_paragraph_3:
    'Bạn nên nhận thức được và chuẩn bị tinh thần rằng 1 phần hoặc tất cả số tài sản bạn đầu tư có thể bị mất.',
  divergence_loss: 'Tổn thất tạm thời',
  divergence_loss_paragraph_1:
    'Khi cung cấp thanh khoản, xin lưu ý rằng lựa chọn không cung cấp thanh khoản (không làm gì cả) vẫn  có thể đem lại nhiều lợi nhuận hơn.',
  divergence_loss_paragraph_2:
    'Divergence Loss còn có một cái tên khác là  “impermanent loss”- Tổn thất tạm thời. Tính từ (impermanent) có thể bị nhầm thành việc bị mất đi tài sản trong tạm thời, đồng nghĩa với với việc các khoản lỗ được đảm bảo là được hoàn lại, điều mà hoàn toàn không hề đúng.',
  divergence_loss_paragraph_3: 'Tìm hiểu thêm về Tổn thất tạm thời',
  staking_risks: 'Rủi ro trong việc staking',
  staking_risks_paragraph_1:
    'Khi staking bạn phải sử dụng một cơ số smart contracts, mỗi smart contract đều có rủi ro riêng.',
  permanent_loss_of_a_peg: 'Tổn thất dài hạn',
  permanent_loss_of_a_peg_paragraph_1:
    'Nếu một trong những loại stablecoins trong bể đột nhiên giảm sâu hơn tỷ giá hối đoái neo là 1.0 và không bao giờ quay lại giá neo đó. Điều đó chứng tỏ tài sản của những nhà cung cấp thanh khoản hầu hết đều là loại stablecoin đó.',
  systemic_issues: 'Lỗi hệ thống',
  systemic_issues_paragraph_1:
    'Về cơ bản, các mảnh của DeFi đều có sự kết nối với nhau, vì vậy một lỗi trong 1 mảnh nhỏ của Defi cũng có thể dẫn đến một chuỗi lỗi của nhiều giao thức.',
  systemic_issues_paragraph_2:
    'Một lỗi hệ thống có thể làm cho bạn mất tiền ngay cả khi lỗi hệ thống đó không tác động trực tiếp đến khoản đầu tư của bạn.',
  systemic_issues_paragraph_3:
    'Những lỗi sau có thể tác động đến bể thanh khoản:',
  systemic_issues_paragraph_4: 'Smart contract của giao thức cho vay bị lỗi',
  systemic_issues_paragraph_5: 'Smart contract trong quá trình staking bị lỗi',
  systemic_issues_paragraph_6:
    'Lỗi hệ thống của stablecoins trong các bể thanh khoản',
  systemic_issues_paragraph_7:
    'Lỗi hệ thống với các ERC20 - native tokens ở trong các bẻ thanh khoản',
  crypto_trading_addiction: 'Nghiện giao dịch crypto',
  crypto_trading_addiction_paragraph_1:
    'Giao dịch tiền điện tử có thể rất dễ gây nghiện và theo nhiều nguồn tin, là một dạng nghiện cờ bạc, có thể hủy hoại cuộc sống.',
  crypto_trading_addiction_paragraph_2:
    'Vui lòng tìm dưới đây một bộ sưu tập các câu chuyện liên quan đến vấn đề đó.',
  crypto_trading_addiction_paragraph_3:
    "'Trading là cờ bạc, không còn nghi ngờ gì nữa'",
  crypto_trading_addiction_paragraph_4:
    "'Tôi đã mất nửa triệu bảng Anh khi giao dịch Bitcoin’'",
  crypto_trading_addiction_paragraph_5:
    "'Chúng tôi nói chuyện với một nhà trị liệu chuyên điều trị chứng nghiện giao dịch tiền điện tử’'",
  crypto_trading_addiction_paragraph_6:
    "''Tôi đã mất hàng triệu USD do nghiện giao dịch tiền điện tử'",
};

const zh_CN = {
  risks: '风险',
  of_using_ref_finance: 'Ref. finance的使用',
  introduction:
    '在 Ref Finance 上提供流动性和/或交易并非没有风险。 在与协议交互之前，请先进行研究并了解所涉及的风险。',
  general_risks_quiz: '一般风险测试',
  amm_core_design: 'AMM核心设计',
  audits: '审计',
  audits_paragraph_2:
    '安全审计并不能完全消除风险。 请不要将您的毕生积蓄或您无法承受损失的资产提供给 Ref Finance，尤其是作为流动性提供者。',
  admin_keys: '管理员密钥',
  admin_keys_paragraph_2:
    '目前的 DAO 有 26 个成员。 Ref Finance 将过渡到完全去中心化的 DAO。',
  admin_keys_paragraph_3:
    '请在下方找到直接管理或目前管理 Ref Finance 事务的合同和地址列表。',
  address: '地址',
  type: '类型',
  mission: '任务',
  exchange_contract: '交换合约',
  table_body_tr_1: '管理自动做市商功能； 交换并提供流动性',
  farming_contract: '农场合约',
  table_body_tr_2: '管理流动性激励措施',
  staking_contract: '质押合约',
  table_body_tr_3: '铸造和销毁 xREF，并分发基于时间的奖励',
  sputnik_dao_contract: 'Sputnik DAO合约',
  table_body_tr_4: '通过制定战略决策（包括智能合约修订）确保 Ref 的成功',
  table_body_tr_5: '管理和分配资金给特定的社区贡献者',
  table_body_tr_6: '执行战略和路线图',
  vesting_contract: '归属合同',
  table_body_tr_7: '管理 Dev DAO 成员的 REF 归属合同',
  airdrop_contract: '空投合约',
  table_body_tr_8: '管理第一个 REF 空投',
  near_address: 'NEAR地址',
  table_body_tr_9: '管理一次性错误赏金支付',
  fungible_token_contract: '可替代代币合约',
  table_body_tr_10: '铸造 REF 代币',
  rug_pull: '地毯拉力',
  rug_pull_paragraph_1:
    '如果代币背后的团队（无论是否列入白名单）决定放弃其项目并拿走投资者的钱，那么该项目的代币可能价值 0 美元。',
  rug_pull_paragraph_2:
    '如果代币在 Ref Finance 上被列入白名单，这并不意味着该项目会成功。 您有责任对项目进行自己的尽职调查，并且应该了解加密是非常高风险的投机性投资。',
  rug_pull_paragraph_3: '您应该意识到并准备好可能损失部分或全部投资资金。',
  divergence_loss: '发散损失',
  divergence_loss_paragraph_1:
    '如果您提供流动性，请注意，您可以通过不提供流动性来赚更多的钱。',
  divergence_loss_paragraph_2:
    '发散损失通常被不恰当地称为“无常损失”。 形容词（无常）可能会假设或创造一种营销感觉，即损失只是无常的，这意味着损失肯定会被逆转，这是不正确的。',
  divergence_loss_paragraph_3: '了解有关发散损失的更多信息',
  staking_risks: '质押风险',
  staking_risks_paragraph_1:
    '质押时，您会使用多种智能合约产品，每种产品都有其自身的风险。',
  permanent_loss_of_a_peg: '永久丢失挂钩',
  permanent_loss_of_a_peg_paragraph_1:
    '如果池中的一个稳定币大幅下跌至低于 1.0 的挂钩并且永远不会回到挂钩，这实际上意味着池流动性提供者几乎持有该货币的所有流动性。',
  systemic_issues: '系统性问题',
  systemic_issues_paragraph_1:
    '一般来说，DeFi 或货币的乐高是高度关联的，这意味着其组件的一个故障可能会引发一连串的故障。',
  systemic_issues_paragraph_2:
    '系统性风险意味着即使失败与您的投资/风险没有直接关系，您也可能会亏损。',
  systemic_issues_paragraph_3: '以下风险可能会对流动资金池产生影响：',
  systemic_issues_paragraph_4: '借贷协议的智能合约问题',
  systemic_issues_paragraph_5: '权益协议的智能合约问题',
  systemic_issues_paragraph_6: '这些池中稳定币的系统性问题',
  systemic_issues_paragraph_7: '这些池中 ERC20 原生代币的系统性问题',
  crypto_trading_addiction: '加密交易成瘾',
  crypto_trading_addiction_paragraph_1:
    '交易加密货币可能会让人上瘾，并且根据许多消息来源，它是一种赌博成瘾的形式，可以摧毁生命。',
  crypto_trading_addiction_paragraph_2: '请在下面找到与该问题相关的故事集。',
  crypto_trading_addiction_paragraph_3: '“交易就是赌博，这是毫无疑问的”',
  crypto_trading_addiction_paragraph_4: '“我在交易比特币时损失了 50 万英镑”',
  crypto_trading_addiction_paragraph_5:
    '“我们与一位治疗加密货币交易成瘾的治疗师交谈”',
  crypto_trading_addiction_paragraph_6:
    '“我因加密货币交易成瘾损失了数百万美元”',
};

const LangMessage = (props: any) => {
  const { id } = props;
  const lang = getCurrentLang();
  return <>{lang[id]}</>;
};

const langFunction = (id: string) => {
  const lang = getCurrentLang();
  return lang[id];
};
const getCurrentLang = () => {
  const local = localStorage.getItem('local') || navigator.language;
  let lang: any;
  switch (local) {
    case 'en':
      lang = en_US;
      break;
    case 'zh-CN':
      lang = zh_CN;
      break;
    case 'vi':
      lang = vi;
      break;
    default:
      lang = en_US;
      break;
  }
  return lang;
};
