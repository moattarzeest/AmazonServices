# Import flask and datetime module for showing date and time
from flask import Flask
import datetime
# import pandas as pd
import boto3
import time
import urllib.request
import json
import boto3
x = datetime.datetime.now()
import uuid
# Initializing flask app
app = Flask(__name__)

# -----------------------------Transcription---------------------------- #

transcribe = boto3.client('transcribe',
aws_access_key_id = 'AKIAXZXYHKGJYMD6ZPRN',
aws_secret_access_key = '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',
region_name = 'us-east-2')

@app.route('/data')



def detect_PII():


    # -----------------------------Transcription---------------------------- #
    audio_file_name = 'recorded_audio.wav'
    job_uri = 's3://my-bucket-for-ml-functions/recorded_audio.wav'
   
 

    job_name = f'transcription_job_{int(time.time())}_{uuid.uuid4()}'
    file_format = audio_file_name.split('.')[1]
    
  # check if name is taken or not
    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={'MediaFileUri': job_uri},
        LanguageCode='en-US')
    
    result = poll_transcription_job(job_name)

    if result['TranscriptionJob']['TranscriptionJobStatus'] == "COMPLETED":
        transcript_file_uri = result['TranscriptionJob']['Transcript']['TranscriptFileUri']
        response = urllib.request.urlopen(transcript_file_uri)
        transcript_data = json.loads(response.read().decode('utf-8'))
        transcript = transcript_data['results']['transcripts'][0]['transcript']
    

 
    # -----------------------------Comprehend and Polly---------------------------- #
    # Initialize the Comprehend client
    comprehend = boto3.client('comprehend', region_name='us-east-2')  # Replace 'us-east-1' with your desired AWS region

    # Text to analyze
    text_to_analyze = transcript

    # Detect PII entities in the text
    response = comprehend.detect_pii_entities(Text=text_to_analyze, LanguageCode='en')

    

     # Extract the detected PII entities
    pii_entities = response.get('Entities', [])

    # Redact PII entities in the text
    redacted_text = text_to_analyze
    for entity in pii_entities:
        entity_start = entity['BeginOffset']
        entity_end = entity['EndOffset']
        redacted_text = redacted_text[:entity_start] + '*' * (entity_end - entity_start) + redacted_text[entity_end:]

        print("Redacted Text=====", redacted_text)

    polly = boto3.client('polly',region_name='us-east-2')

    voice_id = 'Joanna'
    language_code = 'en-US'

    response = polly.synthesize_speech(
         Text=redacted_text,
         OutputFormat='mp3',
         VoiceId=voice_id,
         LanguageCode=language_code
    )

    with open('output.mp3', 'wb') as file:
         file.write(response['AudioStream'].read())

    print("Transcription is:::::::::::", transcript)
    return {
        'statusCode': 200,
        'body': redacted_text,
        

    }


def poll_transcription_job(job_name):
  while True:
    result = transcribe.get_transcription_job(TranscriptionJobName=job_name)
    job_status = result['TranscriptionJob']['TranscriptionJobStatus']
    if job_status in ['COMPLETED', 'FAILED']:
      print("Transcription job status:", job_status)
      return result
    time.sleep(5)

	
# Running app
if __name__ == '__main__':
   app.run(debug=True)
    
    # app.run(debug=True)
    





