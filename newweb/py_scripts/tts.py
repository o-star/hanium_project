import requests
import sys
import wave
url = "https://kakaoi-newtone-openapi.kakao.com/v1/synthesize"
header = {
    "Content-Type" : "application/xml",
    "Authorization" : "KakaoAK a1e32e1055d027ca475ecce06329971a"
}

data = "<speak>" + sys.argv[1] + "</speak>"
print(data)
response = requests.post(url, headers=header, data=data.encode('utf-8'))
rescode = response.status_code
print(rescode)
print(sys.argv[0])
print(sys.argv[1])
print(sys.argv[2])

if rescode == 200:
    with open('/home/ubuntu/hanium_project/newweb/py_scripts/audioFile/'+'result'+sys.argv[2]+'.mp3', 'wb') as f:
        f.write(response.content)
else:
    print("Not valid request!") 
