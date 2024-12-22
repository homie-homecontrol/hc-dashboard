import { notNullish } from "node-homie/model";
import {
    Widget,
    TemplatWidgeteType,
    LayoutWidgetType,
    ControlWidetType,
    MiscWidgetType,
    isTemplateWidget,
    isLayoutWidget,
    Card,
    LayoutWidget,
} from "../model/dash.model";

type templateResolver = (item: Widget, parentValueMap: any) => Widget | Widget[];

const TemplateRegex = new RegExp("{{([^}}]+)}}", "gi");

const resolvers: {
    [index in TemplatWidgeteType | LayoutWidgetType | ControlWidetType | MiscWidgetType]?: templateResolver;
} = {
    template: standardTemplateNormalizer,
};

function templateReplace(str: string, valueMap: any): string {
    if (typeof str !== "string") {
        return str;
    }
    const result = str.replace(TemplateRegex, function (matched, group) {
        return Object.prototype.hasOwnProperty.call(valueMap, group) ? valueMap[group] : "";
    });
    return result;
}

export function recusiveReplace(obj: Widget, valueMap: any): Widget {
    const result: any = {};
    Object.entries(obj)
        .filter(([key, value]) => key !== "items")
        .forEach(([key, value]) => {
            // console.log(`key: ${key}, value: ${value}`)
            if (typeof value === "object" && value !== null) {
                result[key] = recusiveReplace(value, valueMap);
            } else {
                result[key] = templateReplace(value, valueMap);
            }
        });
    if (isLayoutWidget(obj)) {
        result["items"] = obj.items;
    }
    return result;
}

function standardTemplateNormalizer(widget: Widget, parentValueMap: any | undefined = undefined): Widget[] {
    if (widget.type === "template" && widget.valuesList && widget.template) {
        const tmpl = widget.valuesList.flatMap((valueMap) => {
            const values = parentValueMap !== undefined ? { ...parentValueMap, ...valueMap } : valueMap;
            return widget.template.map((item) => {
                const resolvedItem = recusiveReplace(item as any, values);
                if (isLayoutWidget(resolvedItem)) {
                    resolvedItem.items = resolveTemplates(resolvedItem.items, values) as Widget[];
                }
                return resolvedItem;
            });
        });
        return tmpl;
    }
    return [widget];
}

export function resolveTemplates(items: Widget[], valueMap: any = undefined): Widget[] {
    const resolved = items
        .flatMap((item) => {
            if (isTemplateWidget(item)) {
                const resolver = resolvers[item.type];
                if (!resolver) {
                    return item;
                }
                return resolver(item, valueMap);
            }
            if (isLayoutWidget(item)) {
                return { ...item, items: resolveTemplates(item.items) };
            }
            return valueMap ? recusiveReplace(item, valueMap) : item;
        })
        .filter(notNullish);
    return resolved;
}

export function resolveTemplatesInCards(cards: Card[]): Card[] {
    return cards.map((card) => {
        return { ...card, items: resolveTemplates(card.items) };
    });
}
