import { useEffect, useState } from 'react';
import {View } from 'react-native';
import { Camera, CameraType, FaceDetectionResult } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector'
import { styles } from './style';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import neutralImg from "../assets/img/neutro.png"
import smilingImg from "../assets/img/smiling.png"
import winkingImg from "../assets/img/winking.png"

export function Home(){
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const[faceDetected, setFaceDetected] = useState(false);
  const [emoji, setEmoji] = useState(neutralImg);

  const faceValues = useSharedValue({
    width: 0,
    heigth: 0,   
    x: 0,
    y: 0,
  })

  function handleFaceDetected({faces}: FaceDetectionResult){
   const face = faces[0] as any;

   if(face){
    const{size, origin} = face.bounds;
    faceValues.value = {
      width: size.width,
      heigth: size.heigth,
      x: origin.x,
      y: origin.y,
    }
    setFaceDetected(true);

    if(face.smilingProbability > 0.5){
      setEmoji(smilingImg);
    }else if(face.leftEyeOpenProbability < 0.5 && face.rightEyeOpenProbability > 0.5){
      setEmoji(winkingImg);
    }else{
      setEmoji(neutralImg);
    }
    
   }else{
    setFaceDetected(false);
   }
  }

  const animatedStyle = useAnimatedStyle(() =>({
    position: 'absolute',
    zIndex: 1,
    width: faceValues.value.width,
    heigth: faceValues.value.heigth + 100,
    transform: [
      {translateX: faceValues.value.x},
      {translateY: faceValues.value.y -100},
    ],
    
  }))

  useEffect(() =>{
    requestPermission();
  },[]);

  if(!permission?.granted){
    return;
  }

  return (
    <View style={styles.container}>
      {faceDetected &&  
      <Animated.Image 
      style={animatedStyle}
      source={emoji}
      />}
      <Camera 
        style={styles.camera} 
        type={CameraType.front}
        onFacesDetected={handleFaceDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
}


