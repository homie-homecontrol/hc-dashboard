import { HomieDeviceManager, HomieProperty } from "node-homie";
import { Card, CardType, ConditionalCard, DefaultCard, ICard } from "../model/dash.model";
import { collectWidgetProperties, normalizeWidgets } from "./widgets.func";

type CardNormalizer = (item: Card) => Card;

const cardNormalizers: { [index in CardType]?: CardNormalizer } = {
    // conditional: undefined
};


export function normalizeCards(deviceManager: HomieDeviceManager, cards: Card[]): Card[]{
    return cards.map(card => normalizeCard(deviceManager, card));
}


export function normalizeCard(deviceManager: HomieDeviceManager, card: Card): Card {
    const normalizer = cardNormalizers[card.type] || defaultNormalizeCard;
    const nCard = normalizer(card);
    return { ...nCard, items: normalizeWidgets(deviceManager, nCard.items) };
}

function defaultNormalizeCard(card: Card): Card {
    let newCard = { ...card };
    if (card.launchOptions?.pageId) {
        if (card.launchOptions?.wide === null || card.launchOptions?.wide === undefined) {
            newCard = { ...newCard, launchOptions: { ...newCard.launchOptions, wide: true } };
        }
    }
    return newCard;
}


export type propertyCollector<T> = (deviceManager: HomieDeviceManager, card: T) => HomieProperty[];


export const propertyCollectors: { [index in CardType]?: propertyCollector<Card> } = {
    conditional: conditionalCardCollector
};


function conditionalCardCollector(deviceManager: HomieDeviceManager, card: Card): HomieProperty[] {
    const props = [];
    if (card.type === 'conditional' && card.config) {
        const prop = deviceManager.getProperty(card.config.property);
        if (prop?.device?.attributes?.state === "ready") {
            props.push(prop);
        }
    }
    return [...props, ...collectWidgetProperties(deviceManager, card.items)];
}


export function collectCardProperties(deviceManager: HomieDeviceManager, card: Card): HomieProperty[] {
    const coll = propertyCollectors[card.type];
    return coll ? coll(deviceManager, card) : collectWidgetProperties(deviceManager, card.items);

}
