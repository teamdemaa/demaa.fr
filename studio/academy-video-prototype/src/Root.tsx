import React from "react";
import {Composition} from "remotion";
import pilotJson from "../content/pilot.json";
import shortPilotJson from "../content/pilot-short.json";
import timingJson from "../content/timing.generated.json";
import shortTimingJson from "../content/timing-short.generated.json";
import cookiePilotJson from "../content/cookie-v1.json";
import cookieTimingJson from "../content/cookie-v1-timing.generated.json";
import academyThumbnailsJson from "../content/academy-thumbnails.json";
import {CourseVideo} from "./video/CourseVideo";
import {CookieBrandVideo} from "./video/CookieBrandVideo";
import {
  AcademyThumbnail,
  type AcademyThumbnailProps,
} from "./video/AcademyThumbnail";
import {MasterCourseVideo} from "./video/MasterCourseVideo";
import {
  JusteCaseVideo,
  getJusteDuration,
} from "./video/JusteCaseVideo";
import {
  IntroTransitionPreview,
  IntroTransitionVisual,
  IntroTypewriterTest,
} from "./video/IntroTypewriterTest";
import {
  AcademyVerticalCourseTemplate,
  JusteVerticalCaseTemplate,
} from "./video/VerticalCourseTemplate";
import type {GeneratedTiming, Pilot} from "./types";
import justeCourseJson from "../content/courses/juste-systeme-marketing/course.json";

const pilot = pilotJson as Pilot;
const shortPilot = shortPilotJson as Pilot;
const timing = timingJson as GeneratedTiming;
const shortTiming = shortTimingJson as GeneratedTiming;
const cookiePilot = cookiePilotJson;
const cookieTiming = cookieTimingJson;
const justeCourse = justeCourseJson as Pilot;
const defaultAcademyThumbnail = academyThumbnailsJson[
  "chiffre-affaires-benefice"
] as AcademyThumbnailProps & {output: string};
const defaultAcademyThumbnailProps: AcademyThumbnailProps = {
  artwork: defaultAcademyThumbnail.artwork,
  composition: defaultAcademyThumbnail.composition,
  eyebrow: defaultAcademyThumbnail.eyebrow,
  lines: defaultAcademyThumbnail.lines,
  theme: defaultAcademyThumbnail.theme,
};
const silentDurationInFrames = pilot.scenes.reduce(
  (total, scene) => total + Math.round(scene.targetSeconds * pilot.format.fps),
  0,
);
const finalDurationInFrames = Math.ceil(
  timing.totalDurationSeconds * pilot.format.fps,
);
const shortSilentDurationInFrames = shortPilot.scenes.reduce(
  (total, scene) =>
    total + Math.round(scene.targetSeconds * shortPilot.format.fps),
  0,
);
const shortFinalDurationInFrames = Math.ceil(
  shortTiming.totalDurationSeconds * shortPilot.format.fps,
);

export const VideoRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AcademyVerticalCourseTemplate"
        component={AcademyVerticalCourseTemplate}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="JusteVerticalCaseTemplate"
        component={JusteVerticalCaseTemplate}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="JusteMaster"
        component={JusteCaseVideo}
        durationInFrames={getJusteDuration(justeCourse, "master")}
        fps={justeCourse.format.fps}
        width={1920}
        height={1080}
        defaultProps={{pilot: justeCourse, variant: "master", withAudio: false}}
      />
      <Composition
        id="JusteShortProblem"
        component={JusteCaseVideo}
        durationInFrames={getJusteDuration(justeCourse, "short-problem")}
        fps={justeCourse.format.fps}
        width={1080}
        height={1920}
        defaultProps={{
          pilot: justeCourse,
          variant: "short-problem",
          withAudio: false,
        }}
      />
      <Composition
        id="JusteShortContent"
        component={JusteCaseVideo}
        durationInFrames={getJusteDuration(justeCourse, "short-content")}
        fps={justeCourse.format.fps}
        width={1080}
        height={1920}
        defaultProps={{
          pilot: justeCourse,
          variant: "short-content",
          withAudio: false,
        }}
      />
      <Composition
        id="JusteShortAds"
        component={JusteCaseVideo}
        durationInFrames={getJusteDuration(justeCourse, "short-ads")}
        fps={justeCourse.format.fps}
        width={1080}
        height={1920}
        defaultProps={{
          pilot: justeCourse,
          variant: "short-ads",
          withAudio: false,
        }}
      />
      <Composition
        id="JusteShortEconomics"
        component={JusteCaseVideo}
        durationInFrames={getJusteDuration(justeCourse, "short-economics")}
        fps={justeCourse.format.fps}
        width={1080}
        height={1920}
        defaultProps={{
          pilot: justeCourse,
          variant: "short-economics",
          withAudio: false,
        }}
      />
      <Composition
        id="AcademyThumbnail"
        component={AcademyThumbnail}
        durationInFrames={1}
        fps={30}
        width={1280}
        height={720}
        defaultProps={defaultAcademyThumbnailProps}
      />
      <Composition
        id="CookieBrandV1"
        component={CookieBrandVideo}
        durationInFrames={Math.ceil(
          cookieTiming.totalDurationSeconds * cookiePilot.format.fps,
        )}
        fps={cookiePilot.format.fps}
        width={cookiePilot.format.width}
        height={cookiePilot.format.height}
        defaultProps={{pilot: cookiePilot, timing: cookieTiming}}
      />
      <Composition
        id="CookieBrandV1VideoOnly"
        component={CookieBrandVideo}
        durationInFrames={Math.ceil(
          cookieTiming.totalDurationSeconds * cookiePilot.format.fps,
        )}
        fps={cookiePilot.format.fps}
        width={cookiePilot.format.width}
        height={cookiePilot.format.height}
        defaultProps={{
          pilot: cookiePilot,
          timing: cookieTiming,
          withAudio: false,
        }}
      />
      <Composition
        id="IntroTypewriterTest"
        component={IntroTypewriterTest}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="IntroTransitionPreview"
        component={IntroTransitionPreview}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="IntroTransitionVisual"
        component={IntroTransitionVisual}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PrototypeSilent"
        component={CourseVideo}
        durationInFrames={silentDurationInFrames}
        fps={pilot.format.fps}
        width={pilot.format.width}
        height={pilot.format.height}
        defaultProps={{pilot, timing, withAudio: false}}
      />
      <Composition
        id="PrototypeFinal"
        component={CourseVideo}
        durationInFrames={finalDurationInFrames}
        fps={pilot.format.fps}
        width={pilot.format.width}
        height={pilot.format.height}
        defaultProps={{pilot, timing, withAudio: true}}
      />
      <Composition
        id="PrototypeFinalVideoOnly"
        component={CourseVideo}
        durationInFrames={finalDurationInFrames}
        fps={pilot.format.fps}
        width={pilot.format.width}
        height={pilot.format.height}
        defaultProps={{
          pilot,
          timing,
          withAudio: false,
          useTiming: true,
        }}
      />
      <Composition
        id="CourseMaster"
        component={MasterCourseVideo}
        durationInFrames={finalDurationInFrames}
        fps={pilot.format.fps}
        width={pilot.format.width}
        height={pilot.format.height}
        defaultProps={{
          pilot,
          timing,
          withNarration: true,
          withTypingAudio: true,
        }}
        calculateMetadata={({props}) => ({
          durationInFrames: Math.ceil(
            props.timing.totalDurationSeconds * props.pilot.format.fps,
          ),
          fps: props.pilot.format.fps,
          width: props.pilot.format.width,
          height: props.pilot.format.height,
        })}
      />
      <Composition
        id="CourseMasterVideoOnly"
        component={MasterCourseVideo}
        durationInFrames={finalDurationInFrames}
        fps={pilot.format.fps}
        width={pilot.format.width}
        height={pilot.format.height}
        defaultProps={{
          pilot,
          timing,
          withNarration: false,
          withTypingAudio: false,
        }}
        calculateMetadata={({props}) => ({
          durationInFrames: Math.ceil(
            props.timing.totalDurationSeconds * props.pilot.format.fps,
          ),
          fps: props.pilot.format.fps,
          width: props.pilot.format.width,
          height: props.pilot.format.height,
        })}
      />
      <Composition
        id="PrototypeVerticalSilent"
        component={CourseVideo}
        durationInFrames={shortSilentDurationInFrames}
        fps={shortPilot.format.fps}
        width={shortPilot.format.width}
        height={shortPilot.format.height}
        defaultProps={{
          pilot: shortPilot,
          timing: shortTiming,
          withAudio: false,
          audioFile: "audio/narration-short.mp3",
        }}
      />
      <Composition
        id="PrototypeVerticalFinal"
        component={CourseVideo}
        durationInFrames={shortFinalDurationInFrames}
        fps={shortPilot.format.fps}
        width={shortPilot.format.width}
        height={shortPilot.format.height}
        defaultProps={{
          pilot: shortPilot,
          timing: shortTiming,
          withAudio: true,
          audioFile: "audio/narration-short.mp3",
        }}
      />
    </>
  );
};
