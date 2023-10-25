import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import AWS from 'aws-sdk';
import { saveAs } from 'file-saver';
// import { transcribeAudio } from '../components/Transcription.jsx';

function AudioRecorder() {
  const [isRecording, setRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  
  const startRecording = () => {
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);
  };

  const onData = (recordedData) => {
    // Handle audio data as it's being recorded (optional)
    console.log('Audio data:', recordedData);
  };

  const onStop = (recordedData) => {
    // Handle audio data when recording stops
    console.log('Recording stopped:', recordedData);
    setRecordedAudio(recordedData.blob);
  };

  const uploadAudioToS3 = () => 
  {
    if(recordedAudio)
    {
        AWS.config.update({
            region: '<your_region>',
            accessKeyId: '<aws_access_key_id>',
            secretAccessKey: '<aws_secret_access_key>',
          });

          const s3 = new AWS.S3();
          const params = {
            Bucket: '<your_bucket_name>',
            Key: 'recorded_audio.wav', // Set the desired file name
            Body: recordedAudio,
            // ACL: 'public-read', // You can adjust the permissions as needed
          };
          s3.upload(params, (err, data) => {
            if (err) {
              console.error('Error uploading to S3:', err);
            } else {
              console.log('Successfully uploaded to S3:', data.Location);
            }
          });


    }
  }
  

const saveAudio = () => {
    if (recordedAudio) {
      saveAs(recordedAudio, 'recorded_audio.wav'); // You can specify the file name and format here
    }
  };



  
  return (
    <div>
      <h4>Record your audio here:</h4>
      <ReactMic
        record={isRecording}
        className="sound-wave"
        onStop={onStop}
        onData={onData}
      />
      <div>
        {isRecording ? (
          <button className='recordingButton' onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button className='recordingButton' onClick={startRecording}>Start Recording</button>
        )}
         {recordedAudio && (
          <button className='recordingButton' onClick={uploadAudioToS3}>Upload to S3</button>
        )}
      </div>
     
    </div>
  );
}

export default AudioRecorder;




