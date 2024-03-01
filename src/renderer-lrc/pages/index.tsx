import rendererAppConfig from "@/common/app-config/renderer";
import "./index.scss";
import classNames from "@/renderer/utils/classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import Condition from "@/renderer/components/Condition";
import SvgAsset from "@/renderer/components/SvgAsset";
import { ipcRendererInvoke, ipcRendererSend } from "@/common/ipc-util/renderer";
import { PlayerState } from "@/renderer/core/track-player/enum";
import getTextWidth from "@/renderer/utils/get-text-width";
import command from "../utils/command";
import currentPlayerStore from "../store/current-player-store";
import currentProgressStore from "../store/current-progress-store";
import currentLyricStore from "../store/current-lyric-store";

export default function LyricWindowPage() {
  const playerStore = currentPlayerStore.useValue();
  const { music: currentMusic, playerState } = playerStore;
  const lyricAppConfig = rendererAppConfig.useAppConfig()?.lyric;

  const lockLyric = lyricAppConfig?.lockLyric;
  const [showOperations, setShowOperations] = useState(false);

  const mouseOverTimerRef = useRef<number | null>(null);

  // useEffect(() => {
  //   setInterval(() => {
  //     window.extPort.sendToMain({
  //       cmd: " from lyric window!!!",
  //     });
  //   }, 2000);

  //   window.extPort.on(console.log);
  // }, []);

  useEffect(() => {
    if (lockLyric) {
      setShowOperations(false);
    }
  }, [lockLyric]);

  return (
    <div
      className={classNames({
        "lyric-window-container": true,
        "lock-lyric": lockLyric,
      })}
      onMouseOver={() => {
        if (!lockLyric || mouseOverTimerRef.current) {
          if (!lockLyric) {
            setShowOperations(true);
          }
          return;
        }
        mouseOverTimerRef.current = window.setTimeout(() => {
          setShowOperations(true);
          clearTimeout(mouseOverTimerRef.current);
          mouseOverTimerRef.current = null;
        }, 1000);
      }}
      onMouseLeave={() => {
        setShowOperations(false);
        if (mouseOverTimerRef.current) {
          clearTimeout(mouseOverTimerRef.current);
          mouseOverTimerRef.current = null;
        }
      }}
    >
      <Condition condition={showOperations}>
        <div className="lyric-window-operation-container">
          <Condition
            condition={!lockLyric}
            falsy={
              <div
                className="operation-button"
                onClick={() => {
                  ipcRendererSend("set-desktop-lyric-lock", false);
                }}
                onMouseOver={() => {
                  ipcRendererSend("ignore-mouse-event", {
                    ignore: false,
                    window: "lyric",
                  });
                }}
                onMouseLeave={() => {
                  ipcRendererSend("ignore-mouse-event", {
                    ignore: true,
                    window: "lyric",
                  });
                }}
              >
                <SvgAsset iconName="lock-open"></SvgAsset>
              </div>
            }
          >
            <div
              className="operation-button"
              onClick={() => {
                command("skip-prev");
              }}
            >
              <SvgAsset iconName="skip-left"></SvgAsset>
            </div>
            <div
              className="operation-button"
              onClick={() => {
                if (currentMusic) {
                  command(
                    "set-player-state",
                    playerState === PlayerState.Playing
                      ? PlayerState.Paused
                      : PlayerState.Playing
                  );
                }
              }}
            >
              <SvgAsset
                iconName={
                  playerState === PlayerState.Playing ? "pause" : "play"
                }
              ></SvgAsset>
            </div>
            <div
              className="operation-button"
              onClick={() => {
                command("skip-next");
              }}
            >
              <SvgAsset iconName="skip-right"></SvgAsset>
            </div>
            <div
              className="operation-button"
              onClick={() => {
                ipcRendererSend("set-desktop-lyric-lock", true);
              }}
            >
              <SvgAsset iconName="lock-closed"></SvgAsset>
            </div>
            <div
              className="operation-button"
              onClick={() => {
                ipcRendererInvoke("set-lyric-window", false);
              }}
            >
              <SvgAsset iconName="x-mark"></SvgAsset>
            </div>
          </Condition>
        </div>
      </Condition>
      <div className="lyric-window-content-container">
        <LyricContent></LyricContent>
      </div>
    </div>
  );
}

function LyricContent() {
  const lyricStore = currentPlayerStore.useValue();
  // const progress = currentProgressStore.useValue();
  const currentLyric = currentLyricStore.useValue();

  const { lyric = [], music: currentMusic } = lyricStore;

  const lyricAppConfig = rendererAppConfig.useAppConfig()?.lyric;



  const textWidth = useMemo(() => {
    if (currentLyric?.lrc?.lrc) {
      return getTextWidth(currentLyric?.lrc?.lrc, {
        fontSize: lyricAppConfig?.fontSize ?? 48,
        fontFamily: lyricAppConfig?.fontData?.family || undefined,
      });
    } else if (currentMusic) {
      return getTextWidth(`${currentMusic.title} - ${currentMusic.artist}`, {
        fontSize: lyricAppConfig?.fontSize ?? 48,
        fontFamily: lyricAppConfig?.fontData?.family || undefined,
      });
    }
    return 0;
  }, [currentLyric, lyricAppConfig, currentMusic]);

  // const lastIndexRef = useRef(0);

  // const currentIndex = useMemo(() => {
  //   if (!lyric?.length) {
  //     return -1;
  //   }
  //   for (
  //     let i = lastIndexRef.current % lyric.length;
  //     i !== (lastIndexRef.current + lyric.length - 1) % lyric.length;
  //     i = (i + 1) % lyric.length
  //   ) {
  //     if (lyric[i].time >= progress.currentTime) {
  //       lastIndexRef.current = i - 1;
  //       return i - 1;
  //     }
  //   }
  //   lastIndexRef.current = lyric.length - 1;
  //   return lyric.length - 1;
  // }, [lyric, progress]);

  return (
    <div
      className="lyric-text-row"
      style={{
        color: lyricAppConfig?.fontColor,
        WebkitTextStrokeColor: lyricAppConfig?.strokeColor,
        fontSize: lyricAppConfig?.fontSize,
        fontFamily: lyricAppConfig?.fontData?.family || undefined,
        left: textWidth > window.innerWidth ? 0 : undefined,
      }}
    >
      {currentLyric?.lrc?.lrc ??
        (currentMusic
          ? `${currentMusic.title} - ${currentMusic.artist}`
          : "暂无歌词")}
    </div>
  );
}
