'use client';

import type { ChangeEvent } from 'react';
import styles from './index.module.scss';
import { useEffect, useState } from 'react';
import imageUtils from '@/utils/image-utils';
import ErrorDialog from '@/components/dialog/error';
import {
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  TextField,
} from '@mui/material';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';

type ImageInfo = {
  image: HTMLImageElement | null;
  width: number;
  height: number;
  error: boolean;
};

const DefaultImageInfo: ImageInfo = {
  image: null,
  width: 0,
  height: 0,
  error: false,
};

export default function Base64ToImage() {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [base64, setBase64] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo>(DefaultImageInfo);

  useEffect(() => {
    if (!autoUpdate) return;
    transferToImage();
  }, [base64]);

  const transferToImage = async () => {
    if (_isNull(base64)) return;
    if (_isEmpty(base64)) {
      setImageInfo(DefaultImageInfo);
      return;
    }
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
        <Button
          variant="contained"
          className={styles.convertButton}
          onClick={transferToImage}
        >
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
      <div className={styles.imageBlock}>
        {!_isNull(imageInfo.image) && (
          <img
            className={styles.image}
            src={imageInfo.image.src}
            alt="result image"
          />
        )}
      </div>
      <ErrorDialog
        open={imageInfo.error}
        onClose={() => setImageInfo(DefaultImageInfo)}
        errorString="Conversion Error!"
      />
    </Container>
  );
}
