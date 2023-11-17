import React, { useEffect, useState } from 'react';
import {
  CONST_ACKNOWLEDGE_GA,
  CONST_GA_ACTION,
} from 'src/constants/constLocalStorage';
import CustomModal from 'src/components/customModal/customModal';
import './modalGAPrivacy.css';
import { CloseButton } from 'src/context/modal-ui/components/CloseButton';

export const ModalGAPrivacy = () => {
  const [showBottomGA, setShowBottomGA] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const ga = localStorage.getItem(CONST_ACKNOWLEDGE_GA);

  useEffect(() => {
    if (ga === CONST_GA_ACTION.ACCEPT) {
      require('../../../ga4');
    } else {
      setTimeout(() => {
        setShowBottomGA(true);
      }, 1500);
    }
  }, []);

  if (ga) {
    return null;
  }

  const handleAcceptClick = () => {
    require('../../../ga4');
    localStorage.setItem(CONST_ACKNOWLEDGE_GA, CONST_GA_ACTION.ACCEPT);
    showModal && setShowModal(false);
    showBottomGA && setShowBottomGA(false);
  };

  const handleRejectClick = () => {
    localStorage.setItem(CONST_ACKNOWLEDGE_GA, CONST_GA_ACTION.REJECT);
    showModal && setShowModal(false);
    showBottomGA && setShowBottomGA(false);
  };

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const buttonNode = (
    <div className={'flex gap-6 ga-btns'}>
      <button onClick={handleRejectClick} className={'text-white ga-reject'}>
        Reject
      </button>
      <button
        onClick={handleAcceptClick}
        className={'btn-outline'}
        style={{ width: 125 }}
      >
        Accept
      </button>
    </div>
  );

  return (
    <>
      <div className={`bottom-ga ${showBottomGA ? '_show' : ''}`}>
        <div className={'sm:flex justify-between gap-6'}>
          <div
            style={{ maxWidth: 680 }}
            className={'mb-4 sm:mb-0 text-primaryText sm:text-black'}
          >
            By clicking “Accept Cookies”, you agree to the storing of cookies on
            your device to enhance site navigation, analyze site usage, and
            assist in our marketing efforts. Read{' '}
            <span
              className="underline cursor-pointer font-bold font-gothamBold"
              onClick={handleModalOpen}
            >
              Privacy Policy.
            </span>
          </div>
          <div className={'flex gap-6 items-center'}>
            {buttonNode}
            <div className={'bottom-ga-close cursor-pointer text-primaryText'}>
              <CloseButton onClick={() => setShowBottomGA(false)} />
            </div>
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={showModal}
        onClose={handleModalClose}
        className="modal-ga"
        title={'Privacy Policy for Ref.finance'}
      >
        <PrivacyContent />
        <div
          className={'flex justify-end mt-6 text-primaryText'}
          style={{ fontSize: 14 }}
        >
          {buttonNode}
        </div>
      </CustomModal>
    </>
  );
};

const PrivacyContent = () => {
  return (
    <div className="text-primaryText ga-content">
      <p className={'mb-2'}>Last Updated: 14 NOV 2023</p>
      <p>
        This Privacy Policy outlines the practices of Ref Protocol Foundation
        (Folio No. 25049150) (the "Company"), its related corporations, business
        units and affiliates, as well as their respective representatives and/or
        agents (collectively referred to herein as "we", "our", or "us")
        regarding the collection, use, disclosure and sharing of personal
        information when you visit our website https://www.ref.finance/ (the
        "Website"). We recognise our responsibilities in relation to the
        collection, holding, processing, use and/or transfer of personal data.
        Your privacy is of utmost importance to us. By using our website, you
        agree to the terms outlined in this policy. This Privacy Policy
        supplements but does not supersede nor replace any other consent which
        you may have previously provided to us nor does it affect any rights
        that we may have at law in connection with the collection, use and/or
        disclosure of your personal data. We may from time to time update this
        Privacy Policy to ensure that this Privacy Policy is consistent with our
        future developments, industry trends and/or any changes in legal or
        regulatory requirements. Subject to your rights at law, the prevailing
        terms of this Privacy Policy shall apply. When this Privacy Policy is
        updated, we will post a notice on the Website and also change the "Last
        Updated" date indicated at the top. For the avoidance of doubt, this
        Privacy Policy forms part of the terms and conditions governing your
        relationship with us and should be read in conjunction with such terms
        and conditions.
      </p>
      <p>
        The security of your personal data is important to us. At each stage of
        data collection, use and disclosure, we have in place physical,
        electronic, administrative and procedural safeguards to protect the
        personal data stored with us. However, do note that no transmission of
        personal data over the internet can be guaranteed to be 100% secure –
        accordingly and despite our efforts, we cannot guarantee or warrant the
        security of any information you transmit to us, or to or from our online
        services. We shall not have any responsibility or liability for the
        security of information transmitted via the internet.
      </p>
      <p>
        This Privacy Policy describes how we may collect, use, disclose, process
        and manage your personal data, and applies to any individual’s personal
        data which is in our possession or under our control.
      </p>
      <h2>Personal data</h2>
      <p>
        "Personal data" means data, whether true or not, about an individual who
        can be identified (i) from that data, or (ii) from that data and other
        information to which the organisation has or is likely to have access.
        Some examples of personal data that we may collect are:
      </p>
      <div>(a) information or details regarding digital assets held;</div>
      <div>
        (b) particulars of digital wallet addresses (including transactions
        performed by said digital wallet addresses), public cryptographic key
        relating to digital wallet addresses on distributed ledger networks
        and/or similar information;
      </div>
      <div>
        (c) information about your use of our services and Website, and specific
        user interactions with the Website such as features utilised, areas
        visited or clicked on, and time spent; and
      </div>
      <div>
        (d) personal opinions made known to us (e.g. feedback or responses to
        surveys).
      </div>
      <p>
        Personal data will be automatically collected when you interact with our
        services, access the Website, interact with other users of our services,
        sign up for any beta/testing services, open an email from us or fill in
        any form or survey, register a user account or update a user account
        that you registered with us, engage with us (whether through live chat,
        message, phone call, email, social media accounts, messaging platforms,
        attendance at in-person events, opting-in to receive our marketing
        messages, or subscribing to our mailing lists), or make a purchase from
        us.
      </p>
      <p>
        To the extent permitted by law, we may also obtain other information
        about you such as contact information, change of address or demographic
        information from commercially available sources.
      </p>
      <h2>Personal data and the Blockchain</h2>
      <p>
        Blockchain technology, also known as distributed ledger technology
        (DLT), is at the core of our business. Blockchains are decentralised and
        made up of digitally recorded data in a chain of packages called
        "blocks". The manner in which these blocks are linked is chronological,
        meaning that the data is very difficult to alter once recorded. Since
        the ledger may be distributed all over the world (across several "nodes"
        which usually replicate the ledger) this means there is no single person
        making decisions or otherwise administering the system (such as an
        operator of a cloud computing system), and that there is no centralised
        place where it is located either. Accordingly, by design, a blockchain’s
        data cannot be changed or deleted and is said to be "immutable". This
        may affect your ability to exercise your rights such as your right to
        erasure ("right to be forgotten"), or your rights to object or restrict
        processing of your personal data. Data on the blockchain cannot be
        erased and cannot be changed. Although smart contracts may be used to
        revoke certain access rights, and some content may be made invisible to
        others, it is not deleted.
      </p>
      <p>
        In certain circumstances, in order to comply with our contractual
        obligations to you (such as delivery of tokens or provision of other
        services) it will be necessary to collect certain personal data, such as
        your wallet address, onto the blockchain; this is done through a smart
        contract and requires you to execute such transactions using your
        wallet’s private key. The ultimate decisions to (a) transact on the
        blockchain using your wallet address, as well as (b) share the public
        key relating to your wallet address with anyone (including us) rests
        with you. IF YOU WANT TO ENSURE YOUR PRIVACY RIGHTS ARE NOT AFFECTED IN
        ANY WAY, YOU SHOULD NOT TRANSACT ON BLOCKCHAINS AS CERTAIN RIGHTS MAY
        NOT BE FULLY AVAILABLE OR EXERCISABLE BY YOU OR US DUE TO THE
        TECHNOLOGICAL INFRASTRUCTURE OF THE BLOCKCHAIN. IN PARTICULAR THE
        BLOCKCHAIN IS AVAILABLE TO THE PUBLIC AND ANY PERSONAL DATA SHARED ON
        THE BLOCKCHAIN WILL BECOME PUBLICLY AVAILABLE.
      </p>
      Specifically, information regarding your digital wallet addresses
      (including transactions performed by said digital wallet addresses),
      public cryptographic key relating to digital wallet addresses on
      distributed ledger networks and/or similar information which you utilise
      to access the Website will be linked to your user account. By accessing
      our services, you provide your consent to our services reading and/or
      accessing information from such digital wallet addresses in order to
      verify ownership of any digital assets or tokens associated with such
      address (whether fungible or non-fungible). Users will have the ability to
      "add" their digital wallet address to access our services, as well as the
      ability to "remove" such stored wallets. All data obtained by us in
      connection with your digital wallet addresses shall be treated as personal
      data and dealt with in accordance with the provisions of this Privacy
      Policy.
      <h2>Purposes for collection, use and disclosure of your personal data</h2>
      We may collect, use and/or disclose your personal data for its legitimate
      interests or business purposes, including operations for these purposes.
      These may include, without limitation, the following:
      <div>
        (a) developing, providing and improving our products and services
        (whether made available by us or through us) or your participation in
        interactive features of our services;
      </div>
      <div>
        (b) services for purchasing, trading and/or holding of digital assets
        (both fungible and non-fungible);
      </div>
      <div>
        (c) community support and user support, as well as to facilitate
        interactions between users (whether on our platform or outside our
        platform);
      </div>
      <div>
        (d) acting as intermediaries through any blockchain, network or
        platform;
      </div>
      <div>
        (e) recording and/or encryption on any blockchain, network or platform;
      </div>
      <div>
        (f) promoting advertisements or marketing material, whether from us or
        third parties;
      </div>
      <div>
        (g) various products and/or services (whether digital or not, and
        whether provided through an external service provider or otherwise);
      </div>
      <div>
        (h) research, planning, analytics, trouble-shooting, technical
        maintenance and bug fixes;
      </div>
      <div>
        (i) communicating with you, including providing you with updates on
        changes to services or products (whether made available by us or through
        us) including any additions, expansions, suspensions and replacements of
        or to such services or products and their terms and conditions;
      </div>
      <div>
        (j) addressing, investigating or responding to any feedback, queries,
        complaints, claims or disputes in connection with the services;
      </div>
      <div>
        (k) complying with all applicable laws, regulations, rules, directives,
        orders, instructions and requests from any local or foreign authorities,
        including regulatory, governmental, tax and law enforcement authorities
        or other authorities;
      </div>
      <div>
        (l) enforcing obligations owed to us, protecting our rights or property,
        and protecting against legal liability; and/or
      </div>
      <div>(m) seeking professional advice, including legal or tax advice.</div>
      We may also use personal data for purposes set out in the terms and
      conditions that govern our relationship with you or our customer.
      <h2>Use of personal data for marketing purposes</h2>
      We may use your personal data to offer you products or services, including
      special offers, promotions, contests or entitlements that may be of
      interest to you or for which you may be eligible. Such marketing messages
      may be sent to you in various modes including but not limited to
      electronic mail, direct mailers, short message service, telephone calls,
      facsimile and other mobile messaging services, and may be sent directly by
      us or by various third parties which we work with. In doing so, the sender
      will comply with all applicable data protection and privacy laws. In
      respect of sending telemarketing messages to your telephone number via
      short message service, telephone calls, facsimile and other mobile
      messaging services, please be assured that we shall only do so if we have
      your clear and unambiguous consent in writing or other recorded form to do
      so or if you have not otherwise made the appropriate registration of that
      number with the Do Not Call Registry. If we have an ongoing relationship
      with you and you have not indicated to us that you do not wish to receive
      telemarketing messages sent to your telephone number, we may send you
      telemarketing messages to that number related to the subject of our
      ongoing relationship via short message service, facsimile and other mobile
      messaging services (other than a voice or video call). You may at any time
      request that we stop contacting you for marketing purposes via selected or
      all modes. To find out more on how you can change the way we use your
      personal data for marketing purposes, please contact us. Nothing in this
      Privacy Policy shall vary or supersede the terms and conditions that
      govern our relationship with you.
      <h2>Google Analytics</h2>
      We use Google Analytics, a web analytics service provided by Google LLC
      ("Google"). Google Analytics uses cookies to help us analyze how users
      interact with our website. The information generated by the cookie about
      your use of the website (including your IP address) is transmitted to and
      stored by Google on servers in the United States. Google uses this
      information to evaluate your use of the website, compile reports on
      website activity for website operators, and provide other services related
      to website activity and internet usage. Google may also transfer this
      information to third parties if required by law or where third parties
      process the information on Google's behalf. Google will not associate your
      IP address with any other data held by Google. By using our website, you
      consent to the processing of data about you by Google in the manner and
      for the purposes set out above.
      <h2>Cookies and related technologies</h2>
      The Website uses cookies. A cookie is a small text file placed on your
      computer or mobile device when you visit a Website or use an app, which
      may include an anonymous unique identifier. Cookies collect information
      about users and their visit to the Website or use of the app, such as
      their Internet protocol (IP) address, how they arrived at the Website (for
      example, through a search engine or a link from another Website), how they
      navigate within the Website or app, browser information, computer or
      device type, operating system, internet service provider, website usage,
      referring/exit pages, platform type, date/time stamp, number of clicks,
      ads viewed, and how they use our services. We use cookies and other
      technologies to facilitate your internet sessions and use of our apps,
      offer you customised products and/or services according to your preferred
      settings, display features and services which might be of interest to you
      (including ads on our services), track usage of our websites and apps, to
      compile statistics about activities carried out on our websites, and to
      hold certain information. Examples of cookies which we use include,
      without limitation, Sign-in and Authentication Cookies for user
      authentication, Session Cookies to operate our service, Preference Cookies
      to remember your preferences and various settings, Third-Party Cookies
      from third party services to receive and incorporate external data, as
      well as Security Cookies for security purposes. You may set up your web
      browser to block cookies from monitoring your website visit. You may also
      remove cookies stored from your computer or mobile device. However, if you
      do block cookies you may not be able to use certain features and functions
      of our Website.
      <h2>Disclosure and sharing of personal data</h2>
      We may from time to time and in compliance with all applicable laws on
      data privacy, disclose your personal data to any of our personnel, staff,
      employees, officers, group entities, or to third parties (including
      without limitation banks, financial institutions, credit card companies,
      credit bureaus and their respective service providers, companies providing
      services relating to insurance and/or reinsurance to us, and associations
      of insurance companies, agents, contractors or third party service
      providers who provide services to us such as telecommunications,
      information technology, payment, data processing, storage and archival,
      and our professional advisers such as our auditors and lawyers, and
      regulators and authorities), located in any jurisdiction, in order to
      carry out the purposes set out above (including without limitation the
      provision of our services, or as required by any law). Please be assured
      that when we disclose your personal data to such parties, we will disclose
      only the personal information that is necessary to deliver the service
      required, and will also require them to ensure that any personal data
      disclosed to them are kept confidential and secure. For more information
      about the third parties with whom we share your personal data, you may,
      where appropriate, wish to refer to the agreement(s) and/or terms and
      conditions that govern our relationship with you or our customer. You may
      also contact us for more information contact us at the contact details
      provided below. You are responsible for ensuring that the personal data
      you provide to us is accurate, complete, and not misleading and that such
      personal data is kept up to date. You acknowledge that failure on your
      part to do so may result in our inability to provide you with the products
      and services you have requested. To update your personal data, please
      contact us at the contact details provided below. Where you provide us
      with personal data concerning individuals other than yourself, you are
      responsible for obtaining all legally required consents from the concerned
      individuals and you shall retain proof of such consent(s), such proof to
      be provided to us upon our request. We may transfer, store, process and/or
      deal with your personal data in any jurisdiction, and accordingly such
      personal data may be transferred to computers, servers or hardware located
      outside of your state, province, country or other governmental
      jurisdiction where the data protection laws may differ from those in your
      jurisdiction. We will take all steps reasonably necessary to ensure that
      your data is treated securely and in accordance with this Privacy Policy
      and no transfer of your personal data will take place to an organisation
      or a country unless there are adequate controls in place including the
      security of your data and other personal information (including without
      limitation the Standard Contractual Clauses approved by the European
      Commission). Your consent to this Privacy Policy followed by your
      submission of such information represents your agreement to the transfer
      of personal data as described herein.
      <h2>Retention of personal data</h2>
      Your personal data is retained as long as the purpose for which it was
      collected remains and until it is no longer necessary for any legal or
      business purposes. This enables us to comply with legal and regulatory
      requirements or use it where we need to for our legitimate purposes, such
      as transfers of digital assets, and dealing with any disputes or concerns
      that may arise. We may need to retain information for a longer period
      where we need the information to comply with regulatory or legal
      requirements or where we may need it for our legitimate purposes (e.g. to
      help us respond to queries or complaints, fighting fraud and financial
      crime, responding to requests from regulators etc). When we no longer need
      to use personal data, we will remove it from our systems and records
      and/or take steps to anonymise it so that you can no longer be identified
      from it.
      <h2>Queries, Access/Correction Requests and Withdrawal of Consent</h2>
      If you:
      <div>
        (a) have queries about our data protection processes and practices;
      </div>
      <div>
        (b) wish to request access to and/or make corrections to your personal
        data in our possession or under our control; or
      </div>
      <div>
        (c) wish to withdraw your consent to our collection, use or disclosure
        of your personal data, please submit a written request (with supporting
        documents, (if any) to our Data Protection Officer at:
        support@ref.finance. Our Data Protection Officer shall respond to you
        within 30 days of your submission. Please note that if you withdraw your
        consent to any or all use or disclosure of your personal data, depending
        on the nature of your request, we may not be in a position to continue
        to provide our services or products to you or administer any contractual
        relationship in place. Such withdrawal may also result in the
        termination of any agreement you may have with us. Our legal rights and
        remedies are expressly reserved in such event.
      </div>
      <p>
        We may charge you a fee for processing your request for access. Such a
        fee depends on the nature and complexity of your access request.
        Information on the processing fee will be made available to you.
      </p>
      <h2>Your Choices</h2>
      You can control the collection and use of your information by adjusting
      your browser settings, such as disabling cookies. You can also opt-out of
      Google Analytics tracking by using the Google Analytics Opt-Out Browser
      Add-on.
      <h2>Security</h2>
      We take reasonable measures to protect the information collected through
      our website. However, no data transmission over the internet or electronic
      storage is completely secure. We cannot guarantee the security of your
      information.
      <h2>Changes to This Privacy Policy</h2>
      We may update our Privacy Policy from time to time. Any changes will be
      posted on this page with a revised "Last Updated" date.
      <h2>Governing Law and Jurisdiction</h2>
      <p>
        This Privacy Policy and your use of the Website shall be governed and
        construed in accordance with the laws of Singapore. All disputes arising
        out of or in connection with this Privacy Policy (including without
        limitation the enforceability of this Section or any question regarding
        its existence, validity or termination, your access or use of the
        services shall be referred to and finally resolved by arbitration
        administered by the Singapore International Arbitration Centre ("SIAC")
        in accordance with the Arbitration Rules of the Singapore International
        Arbitration Centre ("SIAC Rules") for the time being in force, which
        rules are deemed to be incorporated by reference in this Section. The
        seat of the arbitration shall be Singapore. The Tribunal shall consist
        of 1 arbitrator. The language of the arbitration shall be English. The
        award of the arbitrator will be final and binding, and any judgment on
        the award rendered by the arbitrator may be entered in any court of
        competent jurisdiction. Each party irrevocably submits to the
        jurisdiction and venue of such tribunal. Further, each party will cover
        its own fees and costs associated with the arbitration proceedings.
      </p>
      <h2>Contact Us</h2>
      <p>
        If you have any questions or concerns about this Privacy Policy, you can
        contact us at support@ref.finance.
      </p>
    </div>
  );
};
