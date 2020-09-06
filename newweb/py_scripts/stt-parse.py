# -*- coding: utf-8 -*-
from google.cloud import speech_v1

from google.cloud.speech_v1 import enums

import io
import os
import parseModule as pm
import sys

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

    sample_rate_hertz = 48000 #16000 #44100 #16000
    # Encoding of audio data sent. This sample sets this explicitly.
    # This field is optional for FLAC and WAV audio formats.

    encoding = enums.RecognitionConfig.AudioEncoding.LINEAR16
    config = {
        "language_code": language_code,
        "sample_rate_hertz": sample_rate_hertz,
        "encoding": encoding,
    }
    file_name = os.path.join(
        os.getcwd(),
        'audio_record',
        "result.wav" #sys.argv[7]#'wyhg.wav' #sys.argv[7] #'fzac.wav'#sys.argv[7] nhuy.wav
    )

    with io.open(file_name, "rb") as audio_file:
        content = audio_file.read()

    audio = {"content": content}
    response = client.recognize(config, audio)
    texts = response.results[0].alternatives[0].transcript
    keywords = pm.rankFunction(texts)
    #print(texts)
    #texts = "선박명 현수호 총톤수는 632 톤 2020년 8월 1일 9시 15분에 울산 외항으로 입항할 예정이다"
    #texts = [pm.normalize(text, english=False, number=True) for text in texts]
    # texts 전처리 영어 미포함, 숫자 미포함 설정

    #print(keywords)
    pm.findInOut(keywords)  # 입/출항 추출 함수
    pm.findHarborLocation(keywords)  # 외/내항 추출 함수
    pm.findDate(keywords)  # 날짜 데이터 추출함수
    pm.findTime(keywords)  # 시간 데이터 추출함수
    pm.findShipName(keywords, texts)  # 선박명 추출함수
    pm.findShipWeight(keywords, texts)  # 총톤수 추출함수

    #print(pm.answerDic)
    #print(pm.answerDic['선박명'], pm.answerDic['입/출항'], pm.answerDic['날짜'], pm.answerDic['시간'],
    #      pm.answerDic['외/내항'], pm.answerDic['총톤수'])
    print(pm.answerDic[sys.argv[1]], pm.answerDic[sys.argv[2]], pm.answerDic[sys.argv[3]], pm.answerDic[sys.argv[4]], pm.answerDic[sys.argv[5]], pm.answerDic[sys.argv[6]])

sample_recognize()

#"선박명 정석호 총톤수는 삼백삼십이톤이며 이천이십년 팔월 칠일 십구시 오십분에 울산 외항으로 출항할 예정이다"
#선박명 현수호 총톤수는 632톤 2020년 8월 1일 9시 15분에 울산 외항으로 입항할 예정이다
#총톤수는 58톤 선박명 창묵호 2020년 8월 9일 18시 28분에 울산 내항으로 출항할 예정이다
