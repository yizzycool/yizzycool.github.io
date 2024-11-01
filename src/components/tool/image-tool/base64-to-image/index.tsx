'use client';

import type { ChangeEvent } from 'react';
import styles from './index.module.scss';
import { useEffect, useState } from 'react';
import imageUtils from '@/utils/image-utils';
import {
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  TextField,
} from '@mui/material';
import _isNull from 'lodash/isNull';

type ImageInfo = {
  image: HTMLImageElement | null;
  width: number;
  height: number;
  error: boolean;
};

export default function Base64ToImage() {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [base64, setBase64] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo>({
    image: null,
    width: 0,
    height: 0,
    error: false,
  });

  useEffect(() => {
    if (!autoUpdate) return;
    transferToImage();
  }, [base64]);

  const transferToImage = async () => {
    if (_isNull(base64)) return;
    try {
      const image = await imageUtils.newImageFromBase64(base64);
      const { width, height } = image;
      setImageInfo({ image, width, height, error: false });
    } catch (e) {
      setImageInfo({ image: null, width: 0, height: 0, error: true });
    }
  };

  const onAutoUpdateChecked = (event: ChangeEvent, checked: boolean) => {
    setAutoUpdate(checked);
  };

  const onBase64StringChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const base64String = event.target.value;
    const prefix = /^data:image\/[a-z]+;base64,/;
    if (prefix.test(base64String)) {
      setBase64(base64String);
    } else {
      setBase64(`data:image/png;base64,${base64String}`);
    }
    setBase64(base64String);
  };

  return (
    <Container maxWidth="xl" className={styles.container}>
      <h1 className={styles.title}>Base64 to Image Converter</h1>
      <div className={styles.functionBlock}>
        <FormControlLabel
          control={
            <Checkbox checked={autoUpdate} onChange={onAutoUpdateChecked} />
          }
          label="Auto Update"
        />
        <Button variant="contained" className={styles.convertButton}>
          Convert
        </Button>
      </div>
      <TextField
        className={styles.textArea}
        id="base64-to-image-textarea"
        onChange={onBase64StringChanged}
        autoFocus={true}
        color="primary"
        fullWidth={true}
        multiline={true}
        rows={10}
        label="Paste base64 string here"
      />
      {imageInfo.error || _isNull(imageInfo.image) ? null : (
        <img src={imageInfo.image.src} alt="result image" />
      )}
    </Container>
  );
}
