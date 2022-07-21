import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
// import '@tensorflow/tfjs-backend-wasm';

let detector = null;

export const setup = async () => {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    scoreThreshold: 0.5,
    maxPoses: 1,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
};

export const estimate = (media) => {
  return detector.estimatePoses(media);
};
