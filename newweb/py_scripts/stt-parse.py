# -*- coding: utf-8 -*-
from google.cloud import speech_v1p1beta1

from google.cloud.speech_v1p1beta1 import enums
from google.cloud.speech_v1p1beta1 import types

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
    client = speech_v1p1beta1.SpeechClient()
    # local_file_path = 'resources/brooklyn_bridge.raw'
    # The language of the supplied audio

    language_code = "ko_KR"
    # Sample rate in Hertz of the audio data sent

    # Chrome : 48000 Hz
    # Safari : 16000 Hz
    # Firefox : 44100 Hz
    sample_rate_hertz = 48000

    # Encoding of audio data sent. This sample sets this explicitly.
    # This field is optional for FLAC and WAV audio formats.

    speech_contexts = [
        {"phrases" : "울산", "boost" : 20.0},
        {"phrases" : "묵호", "boost" : 20.0},
        {"phrases" : "선박명", "boost" : 20.0},
        {"phrases" : "외항", "boost" : 20.0},
        {"phrases" : "내항", "boost" : 20.0},
        {"phrases" : "출항", "boost" : 20.0},
        {"phrases" : "입항", "boost" : 20.0},
        {"phrases" : "무게는", "boost" : 20.0},
        {"phrases" : "톤수", "boost" : 20.0},
        {"phrases" : "톤", "boost" : 20.0},
        {"phrases" : "총톤수", "boost" : 20.0},
        {"phrases" : "내항", "boost" : 20.0},
        {"phrases" : "년", "boost" : 20.0},
        {"phrases" : "월", "boost" : 20.0},
        {"phrases" : "일", "boost" : 20.0},
        {"phrases" : "시", "boost" : 20.0},
        {"phrases" : "분", "boost" : 20.0},
        {"phrases" : "초", "boost" : 20.0}
    ]
    encoding = enums.RecognitionConfig.AudioEncoding.LINEAR16
    config = {
        "speech_contexts" : speech_contexts,
        "language_code": language_code,
        "sample_rate_hertz": sample_rate_hertz,
        "encoding": encoding,
    }
    file_name = os.path.join(
        os.getcwd(),
        'audio_record',
        "result.wav"
    )

    with io.open(file_name, "rb") as audio_file:
        content = audio_file.read()

    audio = {"content": content}
    response = client.recognize(config, audio)
    texts = response.results[0].alternatives[0].transcript

    with open("temp_result.txt", "w") as f:
        f.write(texts)

    keywords = pm.rankFunction(texts)

    pm.findInOut(keywords)  # 입/출항 추출 함수
    pm.findHarborLocation(keywords)  # 외/내항 추출 함수
    pm.findDate(keywords)  # 날짜 데이터 추출함수
    pm.findTime(keywords)  # 시간 데이터 추출함수
    pm.findShipName(keywords, texts)  # 선박명 추출함수
    pm.findShipWeight(keywords, texts)  # 총톤수 추출함수

    # 선박명, 입/출항, 날짜, 시간, 외/내항, 총톤수
    print(pm.answerDic[sys.argv[1]], pm.answerDic[sys.argv[2]], pm.answerDic[sys.argv[3]], pm.answerDic[sys.argv[4]], pm.answerDic[sys.argv[5]], pm.answerDic[sys.argv[6]])

sample_recognize()

# 입력 예시 : 선박명 현수호 총톤수는 632톤 2020년 8월 1일 9시 15분에 울산 외항으로 입항할 예정이다
