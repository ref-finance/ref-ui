import * as React from 'react';
import './index.css';
import {
  widget,
  ChartingLibraryWidgetOptions,
  LanguageCode,
  IChartingLibraryWidget,
  ResolutionString,
  Timezone,
} from '../../../../charting_library';

import datafeed from '../../datafeed';
import {
  REF_ORDERLY_SYMBOL_KEY,
  useOrderlyContext,
} from '../../orderly/OrderlyContext';
import moment from 'moment';
import { OrderlyLoading } from '../Common/Icons';
import { isMobile } from '../../../../utils/device';

export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions['symbol'];
  interval: ChartingLibraryWidgetOptions['interval'];
  theme: ChartingLibraryWidgetOptions['theme'];
  // BEWARE: no trailing slash is expected in feed URL
  datafeedUrl: string;
  libraryPath: ChartingLibraryWidgetOptions['library_path'];
  chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
  chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
  clientId: ChartingLibraryWidgetOptions['client_id'];
  userId: ChartingLibraryWidgetOptions['user_id'];
  fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
  autosize: ChartingLibraryWidgetOptions['autosize'];
  studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
  container: ChartingLibraryWidgetOptions['container'];
}

export interface ChartContainerState {}

function getLanguageFromURL(): LanguageCode | null {
  const regex = new RegExp('[\\?&]lang=([^&#]*)');
  const results = regex.exec(window.location.search);
  return results === null
    ? (localStorage.getItem('local')?.split('-')?.[0] as LanguageCode) || null
    : (decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode);
}

export class TVChartContainer extends React.PureComponent<
  Partial<ChartContainerProps>,
  ChartContainerState
> {
  public static defaultProps: Omit<ChartContainerProps, 'container'> = {
    symbol: 'SPOT_NEAR_USDC',
    theme: 'Dark',
    interval: 'D' as ResolutionString,
    datafeedUrl: 'https://demo_feed.tradingview.com',
    libraryPath: '/charting_library/',
    chartsStorageUrl: 'https://saveload.tradingview.com',
    chartsStorageApiVersion: '1.1',
    clientId: 'tradingview.com',
    userId: 'public_user_id',
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
  };

  private tvWidget: IChartingLibraryWidget | null = null;
  private ref: React.RefObject<HTMLDivElement> = React.createRef();

  public componentDidMount(): void {
    if (!this.ref.current) {
    }
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: this.props.symbol as string,
      // BEWARE: no trailing slash is expected in feed URL
      // tslint:disable-next-line:no-any
      theme: this.props.theme,
      datafeed: datafeed,
      interval: this.props.interval as ChartingLibraryWidgetOptions['interval'],
      container: this.ref.current,
      library_path: this.props.libraryPath as string,
      locale: getLanguageFromURL() || 'en',
      disabled_features: ['use_localstorage_for_settings'],
      enabled_features: isMobile()
        ? ['hide_left_toolbar_by_default', 'study_templates']
        : ['study_templates'],
      charts_storage_url: this.props.chartsStorageUrl,
      charts_storage_api_version: this.props.chartsStorageApiVersion,
      client_id: this.props.clientId,
      user_id: ' this.props.userId',
      fullscreen: this.props.fullscreen,
      autosize: this.props.autosize,
      studies_overrides: this.props.studiesOverrides,
    };

    const tvWidget = new widget(widgetOptions);

    this.tvWidget = tvWidget;

    // on ready callbacks
    tvWidget.onChartReady(() => {
      // tvWidget.activeChart().executeActionById('drawingToolbarAction');
    });
  }

  public componentWillUnmount(): void {
    if (this.tvWidget !== null) {
      this.tvWidget.remove();
      this.tvWidget = null;
    }
  }

  public render(): JSX.Element {
    return <div ref={this.ref} className={'TVChartContainer'} />;
  }
}

export function ChartContainer({ maintenance }: { maintenance: boolean }) {
  const { symbol } = useOrderlyContext();

  const [tvWidget, setTvWidget] = React.useState<IChartingLibraryWidget>();

  const ref = React.useRef<HTMLDivElement>(null);

  const storedInterval = localStorage.getItem(
    'tradingview.chart.lastUsedTimeBasedResolution'
  );

  const widgetOptions: ChartingLibraryWidgetOptions = {
    symbol: symbol,
    // BEWARE: no trailing slash is expected in feed URL
    // tslint:disable-next-line:no-any
    theme: 'Dark',
    datafeed: datafeed,
    interval: (storedInterval || 'D') as ResolutionString,
    container: 'TVChartContainer',
    library_path: '/charting_library/',
    locale: getLanguageFromURL() || 'en',
    disabled_features: ['use_localstorage_for_settings'],
    enabled_features: isMobile()
      ? ['hide_left_toolbar_by_default', 'study_templates']
      : ['study_templates'],
    charts_storage_url: 'https://saveload.tradingview.com',
    charts_storage_api_version: '1.1',
    client_id: 'tradingview.com',
    user_id: 'public_user_id',
    fullscreen: false,
    height: 500,
    autosize: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone,
    studies_overrides: {},
    toolbar_bg: 'rgba(1,16,29,1)',
    overrides: {
      'paneProperties.background': 'rgba(1,16,29,1)',
      'paneProperties.backgroundType': 'solid', // or "gradient"
    },
    loading_screen: {
      backgroundColor: 'rgba(1,16,29,1)',
      foregroundColor: 'rgba(1,16,29,1)',
    },
  };

  React.useEffect(() => {
    if (maintenance) return;

    const tvWidget = new widget(widgetOptions);

    const volumeParam = {
      id: 'volume',
      visible: true,
    };

    const checkVolumeIndicator = () => {
      if (tvWidget) {
        const chart = tvWidget.chart();

        const studies = chart.getAllStudies();

        const hasVolumeIndicator = studies.some(
          (study) => study.name === 'Volume'
        );

        return hasVolumeIndicator;
      }
    };

    tvWidget.onChartReady(() => {
      tvWidget
        .chart()
        .onDataLoaded()
        .subscribe(null, () => {
          if (!checkVolumeIndicator()) {
            tvWidget.chart().createStudy('Volume', false, false, volumeParam);
          }
        });
    });

    setTvWidget(tvWidget);
  }, [maintenance]);

  React.useEffect(() => {
    if (!tvWidget) return;

    tvWidget.onChartReady(() => {
      const storedInterval = localStorage.getItem(
        'tradingview.chart.lastUsedTimeBasedResolution'
      );

      tvWidget.setSymbol(
        symbol,
        (storedInterval || 'D') as ResolutionString,
        () => {}
      );
    });
  }, [symbol]);

  return (
    <div
      ref={ref}
      id="TVChartContainer"
      style={{
        height: '52vh',
        position: 'relative',
        background: 'rgba(1,16,29,1)',
      }}
    ></div>
  );
}
