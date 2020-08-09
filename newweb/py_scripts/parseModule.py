from soynlp.tokenizer import MaxScoreTokenizer

answerDic = {}

def rankFunction(texts):
    scores = {'선박명': 0.5, '총톤수는': 0.7, '년': 0.5, '월': 0.5, '일': 0.5, '시': 0.5, '분': 0.5, '울산': 0.5, '예정': 0.5}
    tokenizer = MaxScoreTokenizer(scores=scores)
    keywords = tokenizer.tokenize(texts)
    return keywords

def findDate(keywords):  # 날짜 확인
    dateStr = ""
    ans, temp = 0, 0
    for comp in keywords:
        if comp.find('년') != -1:
            yearnum = comp[0:comp.find('년')]
            if yearnum.isdigit():
                dateStr += yearnum + '-'
                break
    for i in keywords:
        if i.find('월') != -1:
            monthnum = i[0:i.find('월')]
            if monthnum.isdigit():
                dateStr += monthnum.zfill(2) + '-'
                break
    for i in keywords:
        if i.find('일') != -1:
            daynum = i[0:i.find('일')]
            if daynum.isdigit():
                dateStr += daynum.zfill(2)
                break
    answerDic['날짜'] = dateStr

def findTime(keywords):  # 시간 확인
    timeStr = ""
    for i in keywords:
        if i.find('시') != -1:
            timenum = i[0:i.find('시')]
            if timenum.isdigit():
                timeStr += timenum.zfill(2) + ':'
                break
            elif timenum == '공공':
                timeStr += '00:'
                break
    for i in keywords:
        if i.find('분') != -1:
            timenum = i[0:i.find('분')]
            if timenum.isdigit():
                timeStr += timenum.zfill(2)
                break
    answerDic['시간'] = timeStr


def findInOut(keywords):  # 입/출항 확인
    for i in keywords:
        if '입항' in i:
            answerDic['입/출항'] = '입항'
            break
        elif '출항' in i:
            answerDic['입/출항'] = '출항'
            break


def findHarborLocation(keywords):  # 외항/내항 확인
    for i in keywords:
        if '외항' in i:
            answerDic['외/내항'] = '외항'
            break
        elif '내항' in i:
            answerDic['외/내항'] = '내항'
            break

def findShipName(keywords, texts):  # 선박명 확인
    for kwidx in range(len(keywords)):
        if "무게" not in keywords[kwidx] and "이름" not in keywords[kwidx]:
            if "선박명" in answerDic.keys():
                answerDic['선박명'] += keywords[kwidx]
            else:
                answerDic['선박명'] = keywords[kwidx]
        elif "무게" in keywords[kwidx]:
            break

def findShipWeight(keywords, texts): #총톤수 확인
    res = 0
    temp = ""
    for kwidx in range(len(keywords)):
        if "톤" in keywords[kwidx]:
            if keywords[kwidx][:-1].isdigit():
                res += int(keywords[kwidx][:-1])
            temp_idx = kwidx -1
            while temp_idx >= 0 and keywords[temp_idx].isdigit():
                res += int(keywords[temp_idx])
                temp_idx -= 1
        answerDic['총톤수'] = str(res)


#texts = ["선박명 온두리호 총톤수는 육백삼십이톤이며 이천이십년 팔월 십오일 십삼시 오십분에 울산 외항으로 입항할 예정이다"]
# 이름 현수호 무게 632톤 2020년 8월 1일 9시 15분에 울산 외항으로다가 입항할 예정이다
#이름은 효동호 무게는 132톤 2020년 8월 9일 23시 17분에 울산 외항으로 출항할 예정이다
#이름은 타이타닉 로스 포카리 농구 겨드랑이 호 무게는 132톤 2020년 8월 9일 23시 17분에 울산 외항으로 출항할 예정이다