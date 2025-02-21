import Image from 'next/image';
import Typewritter from '../typewriter';

export default function Intro() {
  return (
    <div
      className="relative h-full w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/assets/images/home/background.jpg")' }}
    >
      <div className="absolute left-0 top-0 z-0 h-full w-full bg-transparent dark:bg-neutral-800/70" />
      <div className="relative z-[1] mx-auto h-full max-w-screen-2xl px-4">
        <div className="grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="order-last mx-auto w-[60%] text-center text-sky-950 lg:order-none lg:m-auto lg:text-left dark:text-white">
            <Typewritter />
          </div>
          <div className="m-auto w-fit">
            <Image
              priority={true}
              className="m-auto w-[60%] rounded"
              width={1024}
              height={1024}
              src="/assets/images/home/avatar.png"
              objectFit="contain"
              objectPosition="center"
              alt="main image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
