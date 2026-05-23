'use client';

import type { TdxCamera } from '..';

import flvjs from 'flv.js';
import { useEffect, useMemo, useRef } from 'react';

type Props = {
  cam: TdxCamera;
  onLoadingChange: (loading: boolean) => void;
  onPlayingChange: (playing: boolean) => void;
  onError: VoidFunction;
};

export default function FlvPlayer({
  cam,
  onLoadingChange,
  onPlayingChange,
  onError,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<flvjs.Player | null>(null);

  /**
   * Transforms the provided stream URL into a compatible FLV endpoint.
   * Specific to NTPC (New Taipei City) CCTV APIs which wrap their stream in a viewer page.
   */
  const url = useMemo(() => {
    if (cam.custom?.url) {
      return cam.custom?.url;
    }
    return '';
  }, [cam.custom?.url]);

  /**
   * Handles the initialization, playback, and destruction of the flv.js player.
   * Re-runs whenever the resolved video `url` changes.
   */
  useEffect(() => {
    if (!url) return;

    // Check if the current browser environment supports flv.js (Media Source Extensions)
    if (!flvjs.isSupported()) {
      onError();
      return;
    }

    if (videoRef.current) {
      try {
        onLoadingChange(true);

        // Initialize the flv.js player instance with specific settings for live feeds
        playerRef.current = flvjs.createPlayer(
          {
            type: 'flv',
            isLive: true,
            hasAudio: false,
            url,
          },
          {
            enableStashBuffer: false,
          }
        );

        // Listen for stream or playback errors emitted by flv.js
        playerRef.current.on(
          flvjs.Events.ERROR,
          (errorType, errorDetail, errorInfo) => {
            console.log(
              'FLV Playback Error:',
              errorType,
              errorDetail,
              errorInfo
            );
            onLoadingChange(false);
            onError();
          }
        );

        // Listen for metadata received
        playerRef.current.on(flvjs.Events.METADATA_ARRIVED, () => {
          onLoadingChange(false);
          onPlayingChange(true);
        });

        playerRef.current.attachMediaElement(videoRef.current);
        playerRef.current.load();

        // Start playback. Browsers require the video element to be muted for autoPlay to succeed without interaction.
        const playPromise = playerRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            // Ignore AbortError as it usually happens when the component unmounts quickly or play is intentionally interrupted
            if (err.name !== 'AbortError') {
              console.log('Error:', err);
            }
          });
        }
      } catch (e) {
        console.log('FLV.js Error:', e);
      }
    }

    /**
     * CRITICAL CLEANUP:
     * When the component unmounts or the URL changes, we must thoroughly destroy the player.
     * Failing to do so causes memory leaks and leaves orphaned background network requests.
     */
    return () => {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.unload();
        playerRef.current.detachMediaElement();
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [url]);

  return (
    <video
      ref={videoRef}
      className="h-full w-full object-contain"
      controls={false}
      muted
      autoPlay
      playsInline
    />
  );
}
