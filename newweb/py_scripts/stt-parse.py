from google.cloud import speech_v1

from google.cloud.speech_v1 import enums

import io
import os
from . import parseModule as pm


def sample_recognize():

    """
    Transcribe a short audio file using synchronous speech recognition
    Args:
      local_file_path Path to local audio file, e.g. /path/audio.wav
    """
    client = speech_v1.SpeechClient()
    # local_file_path = 'resources/brooklyn_bridge.raw'
    # The language of the supplied audio

    language_code = "ko_KR"
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
        texts = result.alternatives[0]
        #print(u"Transcript: {}".format(alternative.transcript))


    #texts = ["선박명 온두리호 총톤수는 육백삼십이톤이며 이천이십년 팔월 십오일 십삼시 오십분에 울산 외항으로 입항할 예정이다"]
    texts = [pm.normalize(text, english=False, number=False) for text in texts]
    # texts 전처리 영어 미포함, 숫자 미포함 설정

    keywords = pm.krWordRankFunc(texts);

    pm.findInOut(keywords)  # 입/출항 추출 함수
    pm.findHarborLocation(keywords)  # 외/내항 추출 함수
    pm.findDate(keywords)  # 날짜 데이터 추출함수
    pm.findTime(keywords)  # 시간 데이터 추출함수
    pm.findShipName(keywords, texts)  # 선박명 추출함수
    pm.findShipWeight(keywords)  # 총톤수 추출함수

    #with open('./test.json', 'w', encoding='utf-8') as make_file:
    #    json.dump(answerDic, make_file, ensure_ascii=False)
    # json file write

    #print(texts)
    print(pm.answerDic)


sample_recognize()
