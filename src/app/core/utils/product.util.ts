import { ProductType } from '../models/product-type.enum';
import { AddonModel, AddonTypeConst } from '../../inventory/models/addon.model';
import { bankRound } from './calculation.utils';

export const getProductTypeDescription = (type: ProductType): string => {
  switch (type) {
    case ProductType.FinishedProduct:
      return 'Producto terminado';
    case ProductType.RawProduct:
      return 'Materia prima';
    default:
      return '';
  }
};

export const calculateAddons = (
  price: number,
  addons: AddonModel[]
): [number, number] => {
  let debit = 0.0;
  let credit = 0.0;

  for (let addon of addons) {
    debit += getDebit(price, addon);
    credit += getCredit(price, addon);
  }
  return [debit, credit];
};

export const calculateAddonPerConcept = (
  price: number,
  addons: AddonModel[],
  concepts: { [id: string]: { isDiscount: boolean; total: number } } = {}
) => {
  for (let addon of addons) {
    let debit = getDebit(price, addon);
    let credit = getCredit(price, addon);

    if (addon.isDiscount) {
      concepts[addon.concept] = {
        isDiscount: true,
        total: debit + (concepts[addon.concept]?.total ?? 0),
      };
    } else {
      concepts[addon.concept] = {
        isDiscount: false,
        total: credit + (concepts[addon.concept]?.total ?? 0),
      };
    }
  }
};

export const conceptObjectToFlatArray = (
  concepts: { [id: string]: { isDiscount: boolean; total: number } } = {}
) => {
  let debit = 0;
  let credit = 0;
  var arrayConcepts = Object.keys(concepts).map((key) => {
    debit += concepts[key].isDiscount ? concepts[key].total : 0;
    credit += !concepts[key].isDiscount ? concepts[key].total : 0;
    return {
      concept: key,
      total: concepts[key].total,
      isDiscount: concepts[key].isDiscount,
    };
  });
  return {
    debit: bankRound(debit),
    credit: bankRound(credit),
    flatConcepts: arrayConcepts,
  };
};

function getDebit(price: number, addon: AddonModel) {
  if (addon.isDiscount) {
    return computePercentage(price, addon) + computeAmount(addon);
  }
  return 0;
}

function getCredit(price: number, addon: AddonModel) {
  if (!addon.isDiscount) {
    return computePercentage(price, addon) + computeAmount(addon);
  }
  return 0;
}

function computePercentage(price: number, addon: AddonModel) {
  return addon.type == AddonTypeConst.percentage
    ? price * (addon.value / 100)
    : 0.0;
}

function computeAmount(addon: AddonModel) {
  return addon.type == AddonTypeConst.amount ? addon.value : 0.0;
}
