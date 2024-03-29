import hotkeys from "hotkeys-js";

import trackPlayer from "../track-player";
import { PlayerState, TrackPlayerEvent } from "../track-player/enum";
import { IAppConfig } from "@/common/app-config/type";
import Evt from "../events";
import { shortCutKeys, shortCutKeysEvts } from "@/common/constant";
import rendererAppConfig from "@/common/app-config/renderer";
import { ipcRendererSend } from "@/common/ipc-util/renderer";

const originalHotkeysFilter = hotkeys.filter;

hotkeys.filter = (event) => {
  const target = event.target as HTMLElement;
  if (target.dataset["capture"] === "true") {
    return true;
  }
  return originalHotkeysFilter(event);
};

type IShortCutKeys = keyof IAppConfig["shortCut"]["shortcuts"];

const baseShortCutFunction = (
  evt: keyof IEventType.IEvents,
  global: boolean,
  originalEvt: KeyboardEvent
) => {
  originalEvt.preventDefault();
  if (global && rendererAppConfig.getAppConfigPath("shortCut.enableGlobal")) {
  } else if (rendererAppConfig.getAppConfigPath("shortCut.enableLocal")) {
    Evt.emit(evt);
  }
};

const localShortCutKeyFuncs = {} as Record<any, () => void>;
shortCutKeys.forEach((it) => {
  localShortCutKeyFuncs[it] = baseShortCutFunction.bind(
    undefined,
    shortCutKeysEvts[it],
    false
  );
});

const boundKeyMap = new Map<string, string[]>();
export function bindShortCut(
  key: IShortCutKeys,
  shortCut: string[],
  global = false
) {
  // 原有的快捷键
  const mapKey = `${key}${global ? "-g" : ""}`;
  // const originalHotKey = boundKeyMap.get(mapKey);
  // console.log(originalHotKey, shortCut);
  // if (originalHotKey?.join?.("+") === shortCut?.join?.("+")) {
  //   // 没改
  //   return;
  // }
  unbindShortCut(key, global);
  if (global) {
    ipcRendererSend("bind-global-short-cut", {
      key: key,
      shortCut: shortCut,
    });
  } else {
    hotkeys(shortCut.join("+"), localShortCutKeyFuncs[mapKey]);
  }

  boundKeyMap.set(mapKey, shortCut);
}

export function unbindShortCut(eventType: IShortCutKeys, global = false) {
  // 原有的快捷键
  const mapKey = `${eventType}${global ? "-g" : ""}`;

  const originalHotKey = boundKeyMap.get(mapKey);
  if (originalHotKey) {
    if (global) {
      ipcRendererSend("unbind-global-short-cut", {
        key: eventType,
        shortCut: originalHotKey,
      });
    } else {
      hotkeys.unbind(originalHotKey.join("+"), localShortCutKeyFuncs[mapKey]);
    }
    boundKeyMap.delete(mapKey);
  }
}

export function setupLocalShortCut() {
  // 固定的快捷键
  shortCutKeys.forEach((it) => {
    const val = rendererAppConfig.getAppConfigPath(`shortCut.shortcuts.${it}`);
    if (val && val.local && val.local.length) {
      bindShortCut(it, val.local);
    }
  });
}
