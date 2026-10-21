import {Composition} from 'remotion';
import {Tutorial, TOTAL} from './Composition';
import {Thumb1, Thumb2} from './yt/Thumbs';
import {YTOverlay, YT_FRAMES, Behind1, Behind2, BEHIND1_FRAMES, BEHIND2_FRAMES} from './yt/YT';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Tutorial"
        component={Tutorial}
        durationInFrames={TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition id="YTOverlay" component={YTOverlay} durationInFrames={YT_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Behind1" component={Behind1} durationInFrames={BEHIND1_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Behind2" component={Behind2} durationInFrames={BEHIND2_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Thumb1" component={Thumb1} durationInFrames={1} fps={30} width={1280} height={720} />
      <Composition id="Thumb2" component={Thumb2} durationInFrames={1} fps={30} width={1280} height={720} />
    </>
  );
};
