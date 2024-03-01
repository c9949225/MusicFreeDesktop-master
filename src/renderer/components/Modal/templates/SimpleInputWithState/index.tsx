import { useState } from "react";
import "./index.scss";
import Base from "../Base";
import useMounted from "@/renderer/hooks/useMounted";
import Condition from "@/renderer/components/Condition";
import Loading from "@/renderer/components/Loading";

interface ISimpleInputWithStateProps<PromiseItem> {
  title: string;
  placeholder?: string;
  hints?: string[];
  maxLength?: number;
  withLoading?: boolean; // 是否需要中间状态
  okText?: string;
  loadingText?: string;
  onOk?: (text: string) => any;
  onPromiseResolved?: (result: PromiseItem) => void;
  onPromiseRejected?: (reason?: any) => void;
}

export default function SimpleInputWithState<PromiseItem>(
  props: ISimpleInputWithStateProps<PromiseItem>
) {
  const {
    title,
    placeholder,
    hints,
    maxLength,
    withLoading,
    okText,
    loadingText,
    onOk,
    onPromiseRejected,
    onPromiseResolved,
  } = props;
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const isMounted = useMounted();

  return (
    <Base withBlur={false}>
      <div className="modal--simple-input-with-state shadow backdrop-color">
        <Base.Header>{title}</Base.Header>
        <Condition
          condition={!(loading && withLoading)}
          falsy={<Loading text={loadingText}></Loading>}
        >
          <div className="input-area">
            <input
              placeholder={placeholder}
              onChange={(e) => {
                setInputText(e.target.value.slice(0, maxLength));
              }}
              value={inputText}
            ></input>
          </div>
          <div className="opeartion-area">
            <div
              role="button"
              data-type="primaryButton"
              data-disabled={inputText.length === 0}
              onClick={() => {
                const result = onOk?.(inputText);
                if (withLoading) {
                  setLoading(true);
                }
                result
                  ?.then?.((res: any) => {
                    if (isMounted.current) {
                      onPromiseResolved?.(res);
                      setLoading(false);
                    }
                  })
                  ?.catch((e: any) => {
                    if (isMounted.current) {
                      onPromiseRejected?.(e);
                      setLoading(false);
                    }
                  });
              }}
            >
              {okText ?? "确认"}
            </div>
          </div>
          <Condition condition={hints}>
            <div className="divider"></div>
            <div className="hint-area">
              {hints?.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </div>
          </Condition>
        </Condition>
      </div>
    </Base>
  );
}