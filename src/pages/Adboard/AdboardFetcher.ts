import { REF_ADBOARD_CONTRACT_ID, near } from '~services/near';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import { AdboardUtil } from './AdboardUtil';

export async function getAdboardDataViewState(): Promise<any> {
    const jsonProvider = (await (near.account(REF_ADBOARD_CONTRACT_ID))).connection.provider as JsonRpcProvider;
    const sampleData = "WzEyMizfBN8E0gQ3Od8D1QPfPt8D3z7fA98+1C/fP9IdzATfRNhxziTfQtJC0n7fQ98D3z//AQj/AIPccdUH30LfQt9C3QPfP/8BB/8Ag9li0BffQs0O30PeQ/wBGt9C/wQp2FLfLN8+3wTfBNEEXQ==";
    const framedata = [];
    const metadata = [];

    let resp;
    try {
        resp = await jsonProvider.sendJsonRpc("query", {
            request_type: "view_state",
            finality: "final",
            account_id: REF_ADBOARD_CONTRACT_ID,
            prefix_base64: "",
        });
    }
    catch (e) {
        console.log(e);
        return;
    }

    for (var i = 0; i < resp.values.length; i++) {
        let key = Buffer.from(resp.values[i].key, 'base64').toString().split('::')[0];
        let index = Buffer.from(resp.values[i].key, 'base64').toString().split('::')[1];

        if (key == "f") {
            let value = Buffer.from(resp.values[i].value, 'base64');
            let value2 = AdboardUtil.decompressB64(value.toString());

            framedata[Number(index)] = JSON.parse(value2);
        }

        if (key == "m") {
            let value = Buffer.from(resp.values[i].value, 'base64');
            metadata[Number(index)] = JSON.parse(value.toString());
        }
    }

    //console.log({ framedata: framedata, metadata: metadata });
    return { framedata: framedata, metadata: metadata };
}


