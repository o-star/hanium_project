from google.cloud import speech_v1

from google.cloud.speech_v1 import enums
import io
import os
from . import parseModule as pm
import json

def sample_recognize():

    """
    Transcribe a short audio file using synchronous speech recognition
    Args:
      local_file_path Path to local audio file, e.g. /path/audio.wav
    """

    client = speech_v1.SpeechClient()
    language_code = "ko-KR"

    # Sample rate in Hertz of the audio data sent
    sample_rate_hertz = 44100 #16000

    # Encoding of audio data sent. This sample sets this explicitly.
    # This field is optional for FLAC and WAV audio formats.
    encoding = enums.RecognitionConfig.AudioEncoding.LINEAR16
    config = {

        "language_code": language_code,

        "sample_rate_hertz": sample_rate_hertz,

        "encoding": encoding,
    }

    file_name = os.path.join(
        os.path.dirname(__file__),
        '.',
        'file.wav'
    )

    with io.open(file_name, "rb") as audio_file:
        content = audio_file.read()

    audio = {"content": content}

    response = client.recognize(config, audio)
    texts = ""

    for result in response.results:

        # First alternative is the most probable result

        alternative = result.alternatives[0]
        #texts = result.alternatives[0] break
        print(u"Transcript: {}".format(alternative.transcript))



sample_recognize()