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
      <div className="flex justify-center text-white font-medium text-2xl">
        {!local || local == 'en' ? (
          <>
            <label className="text-greenColor">
              <LangMessage id="risks" />
            </label>
            &nbsp;
            <LangMessage id="of_using_ref_finance" />
          </>
        ) : (
          <>
            <LangMessage id="of_using_ref_finance" />
            <label className="text-greenColor">
              <LangMessage id="risks" />
            </label>
          </>
        )}
      </div>
      <div className="text-primaryText text-sm mt-3">
        <LangMessage id="introduction" />
      </div>
      <div className="flex justify-center items-center mt-5">
        <div
          onClick={() => {
            window.open(
              'https://form.typeform.com/to/EPmUetxU?typeform-source=mzko2gfnij6.typeform.com'
            );
          }}
          className="flex justify-between items-center w-48 bg-cardBg rounded-lg px-2.5 py-1.5 text-sm text-primaryText cursor-pointer hover:text-blueTip mr-2.5"
        >
          <LangMessage id="general_risks_quiz" />
          <ExternalLinkIcon></ExternalLinkIcon>
        </div>
        <div
          onClick={() => {
            window.open('https://uniswap.org/whitepaper.pdf');
          }}
          className="flex justify-between items-center w-48 bg-cardBg rounded-lg px-2.5 py-1.5 text-sm text-primaryText cursor-pointer hover:text-blueTip"
        >
          <LangMessage id="amm_core_design" />
          <ExternalLinkIcon></ExternalLinkIcon>
        </div>
      </div>
      <div className="mt-7">
        <ModuleTemplate title={langFunction('audits')}>
          <p className="text-sm text-primaryText mb-4">
            {!local || local == 'en' ? (
              <>
                <LangMessage id="audits_paragraph_half" />
                &nbsp;
                <label
                  className="cursor-pointer text-white"
                  onClick={() => {
                    window.open('https://jitadigital.com/');
                  }}
                >
                  <LangMessage id="audits_paragraph_words" />
                </label>
                &nbsp;
                <LangMessage id="audits_paragraph_second_half" />
              </>
            ) : (
              <>
                <label
                  className="cursor-pointer text-white"
                  onClick={() => {
                    window.open('https://jitadigital.com/');
                  }}
                >
                  <LangMessage id="audits_paragraph_words" />
                </label>
                <LangMessage id="audits_paragraph_half" />
                <LangMessage id="audits_paragraph_second_half" />
              </>
            )}
          </p>
          <p className="text-sm text-primaryText">
            <LangMessage id="audits_paragraph_2" />
          </p>
        </ModuleTemplate>
        <ModuleTemplate title={langFunction('admin_keys')}>
          <p className="text-sm text-primaryText mb-4">
            {!local || local == 'en' ? (
              <>
                Ref Finance is managed by the{' '}
                <label
                  onClick={() => {
                    window.open(
                      'https://app.astrodao.com/dao/ref-finance.sputnik-dao.near'
                    );
                  }}
                  className="text-white cursor-pointer"
                >
                  Ref Finance Sputnik DAO
                </label>
                . There are{' '}
                <label
                  className="text-white cursor-pointer"
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
            ) : (
              <>
                Ref Finance由
                <label
                  onClick={() => {
                    window.open(
                      'https://app.astrodao.com/dao/ref-finance.sputnik-dao.near'
                    );
                  }}
                  className="text-white cursor-pointer"
                >
                  Ref Finance Sputnik DAO
                </label>
                组织管理。有
                <label
                  className="text-white cursor-pointer"
                  onClick={() => {
                    window.open(
                      'https://gov.ref.finance/t/introducing-the-guardians/253'
                    );
                  }}
                >
                  监护人
                </label>
                ，具体的NEAR地址，可以暂停合约，只有DAO组织可以在任意时间恢复。
              </>
            )}
          </p>
          <p className="text-sm text-primaryText mb-4">
            <LangMessage id="admin_keys_paragraph_2" />
          </p>
          <p className="text-sm text-primaryText">
            <LangMessage id="admin_keys_paragraph_3" />
          </p>
          <div className="mt-6">
            <table className="bg-black bg-opacity-20 table-fixed">
              <thead>
                <tr className="text-sm text-primaryText text-left bg-black bg-opacity-25">
                  <th className="rounded-t-lg py-2.5 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="address" />
                  </th>
                  <th className="py-2.5 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="type" />
                  </th>
                  <th className=" rounded-t-lg py-2.5 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="mission" />
                  </th>
                </tr>
              </thead>
              <tbody className="">
                <tr className="text-xs text-primaryText border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
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
                <tr className="text-xs text-primaryText border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
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
                <tr className="text-xs text-primaryText border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
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
                <tr className="text-xs text-primaryText border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
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
                <tr className="text-xs text-primaryText border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
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
                <tr className="text-xs text-primaryText border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
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
                <tr className="text-xs text-primaryText border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
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
                <tr className="text-xs text-primaryText border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
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
                <tr className="text-xs text-primaryText border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
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
                <tr className="text-xs text-primaryText border-b border-white border-opacity-10 bg-blend-overlay hover:bg-poolRowHover hover:bg-opacity-20 hover:text-white">
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    token.v2.ref-finance.near{' '}
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="fungible_token_contract" />
                  </td>
                  <td className="py-3 px-4 xs:px-2.5 md:px-2.5">
                    <LangMessage id="table_body_tr_10" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ModuleTemplate>
        <ModuleTemplate title={langFunction('rug_pull')}>
          <p className="text-sm text-primaryText mb-4">
            <LangMessage id="rug_pull_paragraph_1" />
          </p>
          <p className="text-sm text-primaryText mb-4">
            <LangMessage id="rug_pull_paragraph_2" />{' '}
          </p>
          <p className="text-sm text-primaryText">
            <LangMessage id="rug_pull_paragraph_3" />
          </p>
        </ModuleTemplate>
        <ModuleTemplate title={langFunction('divergence_loss')}>
          <p className="text-sm text-primaryText mb-4">
            <LangMessage id="divergence_loss_paragraph_1" />
          </p>
          <p className="text-sm text-primaryText mb-4">
            <LangMessage id="divergence_loss_paragraph_2" />
          </p>
          <div className="overflow-hidden">
            <p
              className="flex items-center text-sm text-primaryText mb-4 cursor-pointer float-left hover:text-white"
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
          <p className="text-sm text-primaryText">
            <LangMessage id="staking_risks_paragraph_1" />
          </p>
        </ModuleTemplate>
        <ModuleTemplate title={langFunction('permanent_loss_of_a_peg')}>
          <p className="text-sm text-primaryText">
            <LangMessage id="permanent_loss_of_a_peg_paragraph_1" />
          </p>
        </ModuleTemplate>
        <ModuleTemplate title={langFunction('systemic_issues')}>
          <p className="text-sm text-primaryText mb-4">
            <LangMessage id="systemic_issues_paragraph_1" />
          </p>
          <p className="text-sm text-primaryText mb-4">
            <LangMessage id="systemic_issues_paragraph_2" />
          </p>
          <p className="text-sm text-primaryText mb-4">
            <LangMessage id="systemic_issues_paragraph_3" />
          </p>
          <p className="text-sm text-primaryText">
            - <LangMessage id="systemic_issues_paragraph_4" />
          </p>
          <p className="text-sm text-primaryText">
            - <LangMessage id="systemic_issues_paragraph_5" />
          </p>
          <p className="text-sm text-primaryText">
            - <LangMessage id="systemic_issues_paragraph_6" />
          </p>
          <p className="text-sm text-primaryText">
            - <LangMessage id="systemic_issues_paragraph_7" />
          </p>
        </ModuleTemplate>
        <ModuleTemplate title={langFunction('crypto_trading_addiction')}>
          <p className="text-sm text-primaryText mb-4">
            <LangMessage id="crypto_trading_addiction_paragraph_1" />
          </p>
          <p className="text-sm text-primaryText mb-4">
            <LangMessage id="crypto_trading_addiction_paragraph_2" />{' '}
          </p>
          <div className="overflow-hidden">
            <p
              onClick={() => {
                window.open(
                  'https://www.theguardian.com/technology/2022/jan/15/trading-is-gambling-no-doubt-about-it-how-cryptocurrency-dealing-fuels-addiction'
                );
              }}
              className="flex items-center hover:text-white cursor-pointer text-sm text-primaryText mb-4 float-left"
            >
              '<LangMessage id="crypto_trading_addiction_paragraph_3" />'
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
              className="flex items-center cursor-pointer text-sm text-primaryText hover:text-white mb-4 float-left"
            >
              '<LangMessage id="crypto_trading_addiction_paragraph_4" />'
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
              className="flex items-center cursor-pointer text-sm hover:text-white text-primaryText mb-4 float-left"
            >
              '<LangMessage id="crypto_trading_addiction_paragraph_5" />'
              <ExternalLinkIcon className="ml-2 flex-shrink-0"></ExternalLinkIcon>
            </p>
          </div>
          <div className="overflow-hidden">
            <p
              onClick={() => {
                window.open('https://www.bbc.co.uk/news/uk-scotland-57268024');
              }}
              className="flex items-center cursor-pointer text-sm text-primaryText float-left hover:text-white"
            >
              '<LangMessage id="crypto_trading_addiction_paragraph_6" />'
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
  of_using_ref_finance: 'of using Ref. finance',
  introduction:
    'Providing liquidity and/or trading on Ref Finance do not come without risks. Before interacting with the protocol, please do research and understand the risks involved.',
  general_risks_quiz: 'General Risks Quiz',
  amm_core_design: 'AMM Core Design',
  audits: 'Audits',
  audits_paragraph_half: 'Ref Finance smart contracts are being audited by',
  audits_paragraph_words: 'Jita.',
  audits_paragraph_second_half:
    'Ref Finance will actively look for a second independent audit once the first audit is completed.',
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
    'Trading is gambling, no doubt about it',
  crypto_trading_addiction_paragraph_4:
    'I Lost Half a Million Pounds Trading Bitcoin.',
  crypto_trading_addiction_paragraph_5:
    'We Spoke to a Therapist Who Treats Cryptocurrency Trading Addiction.',
  crypto_trading_addiction_paragraph_6:
    'I lost millions through cryptocurrency trading addiction.',
};

const zh_CN = {
  risks: '风险',
  of_using_ref_finance: 'Ref. finance的使用',
  introduction:
    '在Ref Finance平台上提供流动性或交易不是一点风险没有，在使用协议之前，请先进行研究，并了解所涉及的风险。',
  general_risks_quiz: '一般风险测试',
  amm_core_design: 'AMM核心设计',
  audits: '审计',
  audits_paragraph_half: '正在审计Ref Finance的智能合约，',
  audits_paragraph_words: 'Jita',
  audits_paragraph_second_half:
    '在第一次审计完成后，Ref Finance 将会积极寻找第二次独立审计。',
  audits_paragraph_2:
    '安全审计不能完全消除风险，请不要把你的毕生积蓄或你不能承受的资产损失提供给Ref Finance，尤其是作为一个流动性提供者。',
  admin_keys: 'Admin密钥',
  admin_keys_paragraph_2:
    '目前DAO有26个成员。Ref Finance将过渡到一个完全分散的DAO组织。',
  admin_keys_paragraph_3:
    '以下是直接管理或目前管理Ref Finance事务的合同和地址列表',
  address: '地址',
  type: '类型',
  mission: '任务',
  exchange_contract: '交换合约',
  table_body_tr_1: '管理自动做市商的职能;兑换和提供流动性',
  farming_contract: '农场合约',
  table_body_tr_2: '流动性管理激励',
  staking_contract: '质押合约',
  table_body_tr_3: '铸造和消耗xREF，并分发基于时间的奖励',
  sputnik_dao_contract: 'Sputnik DAO合约',
  table_body_tr_4: '通过战略决策(包括智能合约修订)确保Ref的成功',
  table_body_tr_5: '管理和分配资金给特定的社区贡献者',
  table_body_tr_6: '执行战略和路线图',
  vesting_contract: '持股合约',
  table_body_tr_7: '管理Dev DAO成员的REF持股合约',
  airdrop_contract: '空投合约',
  table_body_tr_8: '管理第一REF空投',
  near_address: 'NEAR地址',
  table_body_tr_9: '管理一次性的bug奖励',
  fungible_token_contract: '替代性代币合约',
  table_body_tr_10: '铸造REF代币',
  rug_pull: '地毯拉动',
  rug_pull_paragraph_1:
    '如果一个代币背后的团队，无论是白名单还是非白名单，决定放弃其项目并接受投资者的资金，该项目的代币可能值0美元。',
  rug_pull_paragraph_2:
    '如果token在Ref Finance上被列入白名单，这并不意味着该项目将成功,您有责任对项目进行尽职调查，并应了解加密货币是非常高风险的投机性投资。',
  rug_pull_paragraph_3: '你应该意识到并做好可能损失部分或全部投资资金的准备。',
  divergence_loss: '差异损失',
  divergence_loss_paragraph_1:
    '如果你提供流动资金，请注意，你可以通过不提供流动资金来赚更多的钱。',
  divergence_loss_paragraph_2:
    '差异损失常被不恰当地称为“暂时性损失”。形容词(impermanent)可能会假定或制造一种营销感觉，即损失只是暂时的，意味着损失是可以挽回的，但这是不正确的。',
  divergence_loss_paragraph_3: '了解更多关于差异损失的信息',
  staking_risks: '质押风险',
  staking_risks_paragraph_1:
    '当质押时，您使用多个智能合约产品，每个产品都有自己的风险。',
  permanent_loss_of_a_peg: '永久性损失挂钩',
  permanent_loss_of_a_peg_paragraph_1:
    '如果其中一种稳定币在货币池中显著低于1.0的挂钩汇率，并且永远不会回到挂钩汇率，这实际上意味着，货币池流动性提供者几乎所有的流动性都是用该货币持有的。',
  systemic_issues: '系统性的问题',
  systemic_issues_paragraph_1:
    '一般来说，DeFi或金钱的乐高是高度相关的，这意味着它的一个组件的失败可能会引发一系列的失败。',
  systemic_issues_paragraph_2:
    '系统性风险意味着即使失败与你的投资/接触没有直接关系，你也可能会赔钱。',
  systemic_issues_paragraph_3: '以下风险可能对流动性池产生影响：',
  systemic_issues_paragraph_4: '智能合约与贷款协议存在问题',
  systemic_issues_paragraph_5: '智能合约与质押议存在问题',
  systemic_issues_paragraph_6: '这些资金池中的稳定币存在系统性问题',
  systemic_issues_paragraph_7: '这些池中的erc20原生代币存在系统性问题',
  crypto_trading_addiction: '加密交易瘾',
  crypto_trading_addiction_paragraph_1:
    '加密货币交易非常容易上瘾，据许多消息来源称，这是一种赌博上瘾，可以毁掉生活。',
  crypto_trading_addiction_paragraph_2: '下面是一些与此相关的故事。',
  crypto_trading_addiction_paragraph_3: '毫无疑问，交易就是赌博',
  crypto_trading_addiction_paragraph_4: '我在比特币交易中损失了50万英镑。',
  crypto_trading_addiction_paragraph_5:
    '我们采访了一位治疗加密货币交易成瘾的治疗师。',
  crypto_trading_addiction_paragraph_6:
    '我因为沉迷于加密货币交易而损失了数百万美元。',
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
    default:
      lang = en_US;
      break;
  }
  return lang;
};
