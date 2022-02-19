import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminGifLossy from "imagemin-giflossy";
import imageminSvgo from "imagemin-svgo";
import imageminPngquant from "imagemin-pngquant";

export const compressImage = async (buffer) => {
  const compressedImage = await imagemin.buffer(buffer, {
    plugins: [
      imageminGifLossy({ lossy: 80 }),
      imageminMozjpeg({ quality: 80 }),
      imageminPngquant({ quality: [0.6, 0.8] }),
      imageminSvgo({
        plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
      }),
    ],
  });
  return compressedImage;
};
