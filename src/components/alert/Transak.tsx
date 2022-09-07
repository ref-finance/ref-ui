import transakSDK from '@transak/transak-sdk'
import {getTransakConfig} from "~services/config";

export function openTransak() {
  const transak = new transakSDK(
    getTransakConfig()
  )
  transak.init()
  transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
    transak.close()
  })
  transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, () => {
    console.log('Transaction order was failed');
  })
  transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (successData: any) => {
    const fiatCurrency = successData?.status?.fiatCurrency
    const fiatAmount = successData?.status?.fiatAmount
    const cryptoCurrency = successData?.status?.cryptoCurrency
    const cryptoAmount = successData?.status?.cryptoAmount
    console.log(`Transaction order to buy from ${fiatAmount} ${fiatCurrency} to ${cryptoAmount} ${cryptoCurrency} was successfully, please wait for 1-3 minutes for completing the order`);
    transak.close()
  })
}