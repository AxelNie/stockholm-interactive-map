import { getPricesWithLocations } from "@/queries/getAppartmentPrices";

// worker.ts
addEventListener('message', (event: MessageEvent) => {

    const result = fetchAppertmentPriceData();

    postMessage(result);
});

async function fetchAppertmentPriceData(): any {
    const pricesData = await getPricesWithLocations();

    return data;
}
