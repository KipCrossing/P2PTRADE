import type { EscrowInfo } from "../types/escrowInfo";

import { writable } from "svelte/store";

export const escrowList = writable([]);

const ACCOUNT_ESCROW_LISTS = "accountEscrowLists";

function getAccountEscrowMap(): Map<string, EscrowInfo[]> {
  const aem = localStorage.getItem(ACCOUNT_ESCROW_LISTS);
  if (aem) {
    // Parse the JSON string and convert it back into a Map
    const obj = JSON.parse(aem);
    // Convert all keys to lowercase
    const lowerCaseObj = Object.keys(obj).reduce((acc, key) => {
      acc[key.toLowerCase()] = obj[key];
      return acc;
    }, {});
    return new Map(Object.entries(lowerCaseObj));
  }
  return new Map<string, EscrowInfo[]>();
}

export function getEscrowList(account: string): EscrowInfo[] {
  const aem = getAccountEscrowMap();
  const el = aem.get(account.toLowerCase()) || [];
  escrowList.set(el);
  return el;
}

export function updateEscrowList(escrowInfo: EscrowInfo, account: string) {
  const aem: Map<string, EscrowInfo[]> = getAccountEscrowMap();
  const escrowListTemp = aem.get(account.toLowerCase()) || [];
  escrowListTemp.push(escrowInfo);
  escrowList.set(escrowListTemp);
  aem.set(account.toLowerCase(), escrowListTemp);
  // Convert the Map into an object, and then stringify it
  const obj = Object.fromEntries(aem.entries());
  localStorage.setItem(ACCOUNT_ESCROW_LISTS, JSON.stringify(obj));
}
