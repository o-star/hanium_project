import requests
import simpleaudio as sa
import sys
import soundfile
import wave
url = "https://kakaoi-newtone-openapi.kakao.com/v1/synthesize"
header = {
    "Content-Type" : "application/xml",
    "Authorization" : "KakaoAK a1e32e1055d027ca475ecce06329971a"
}
#print(sys.argv[1])
data = "<speak>" + sys.argv[1] + "</speak>"
print(data)
response = requests.post(url, headers=header, data=data.encode('utf-8'))
rescode = response.status_code
print(rescode)
#print("Server response code : " + str(rescode))
if rescode == 200:
    with open("./py_scripts/tts_result.mp3", 'wb') as f:
        f.write(response.content)
    #wave_obj = sa.WaveObject.from_wave_file("./py_scripts/tts_result.mp3")
    #print(wave_obj)
    #play_obj = wave_obj.play()
    #play_obj.wait_done()
    #print("Saved audio file!")
else:
    print("Not valid request!") 
