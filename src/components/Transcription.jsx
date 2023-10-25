import AWS from 'aws-sdk';
import { TranscribeService } from 'aws-sdk';

// Configure AWS with your credentials
AWS.config.update({
  accessKeyId: '<aws_access_key_id>',
  secretAccessKey: '<aws_secret_access_key>',
  region: '<your_region>',
});
const transcribeService = new TranscribeService();

export const transcribeAudio = (jobName, languageCode, mediaFormat, s3Bucket, s3Key) => {
  const params = {
    LanguageCode: languageCode, // e.g., 'en-US' for English
    Media: {
      MediaFileUri: `s3://${s3Bucket}/${s3Key}`,
    },
    MediaFormat: mediaFormat, // e.g., 'wav' or 'mp3'
    TranscriptionJobName: jobName,
    OutputBucketName: '<your_bucket_name>', // The bucket where the transcription results will be stored
  };

  transcribeService.startTranscriptionJob(params, (err, data) => {
    if (err) {
      console.error('Error starting transcription job:', err);
    } else {
      console.log('Transcription job started:', data.TranscriptionJob.TranscriptionJobName);
    }
  });
};


