import rendererAppConfig from "@/common/app-config/renderer";
import {
  IAppConfigKeyPath,
  IAppConfigKeyPathValue,
} from "@/common/app-config/type";
import { Listbox } from "@headlessui/react";
import "./index.scss";
import defaultAppConfig from "@/common/app-config/default-app-config";
import Condition from "@/renderer/components/Condition";
import Loading from "@/renderer/components/Loading";
import { isBasicType } from "@/common/normalize-util";
import useVirtualList from "@/renderer/hooks/useVirtualList";
import { rem } from "@/common/constant";
import { Fragment, useEffect, useRef } from "react";
import { ipcRendererInvoke, ipcRendererSend } from "@/common/ipc-util/renderer";
import { toast } from "react-toastify";

interface PathSettingItemProps<T extends IAppConfigKeyPath> {
  keyPath: T;
  label?: string;
  value?: IAppConfigKeyPathValue<T>;
}

export default function PathSettingItem<T extends IAppConfigKeyPath>(
  props: PathSettingItemProps<T>
) {
  const { keyPath, label, value } = props;

  return (
    <div className="setting-view--path-setting-item-container setting-row">
      <div className="label-container">{label}</div>
      <div className="options-container">
        <span className="path-container" title={value as string}>
          {value as string}
        </span>
        <div
          role="button"
          data-type="primaryButton"
          onClick={async () => {
            const result = await ipcRendererInvoke("show-open-dialog", {
              title: "选择路径",
              defaultPath: value as string,
              properties: ["openDirectory"],
              buttonLabel: "确认",
            });
            if (!result.canceled) {
              rendererAppConfig.setAppConfigPath(
                keyPath,
                result.filePaths[0]! as any
              );
            }
          }}
        >
          更改路径
        </div>
        <div
          role="button"
          data-type="normalButton"
          onClick={async () => {
            if (await window.fs.isFolder(value as string)) {
              ipcRendererSend("open-path", value as string);
            } else {
              toast.error("文件夹不存在");
            }
          }}
        >
          打开文件夹
        </div>
      </div>
      {/* </Listbox> */}
    </div>
  );
}
