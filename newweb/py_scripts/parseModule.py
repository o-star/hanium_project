from krwordrank.hangle import normalize
from krwordrank.word import KRWordRank
import json

numberDic = {
    '한': 1, '두': 2, '세': 3, '네': 4, '다섯': 5, '여섯': 6, '일곱': 7, '여덜': 8, '아홉': 9, '열': 10, '열한': 11, '열두': 12,
    '공일': 1, '공이': 2, '공삼': 3, '공사': 4, '공오': 5, '공육': 6, '공칠': 7, '공팔': 8, '공구': 9,
    '일': 1, '이': 2, '삼': 3, '사': 4, '오': 5, '육': 6, '유': 6, '칠': 7, '팔': 8, '구': 9, '십': 10, '시': 10,
    '십일': 11, '십이': 12, '십삼': 13, '십사': 14, '십오': 15, '십육': 16, '십칠': 17, '십팔': 18, '십구': 19, '이십': 20,
    '이십일': 21, '이십이': 22, '이십삼': 23, '이십사': 24, '이십오': 25, '이십육': 26, '이십칠': 27, '이십팔': 28, '이십구': 29, '삼십': 30,
    '삼십일': 31, '삼십이': 32, '삼십삼': 33, '삼십사': 34, '삼십오': 35, '삼십육': 36, '삼십칠': 37, '삼십팔': 38, '삼십구': 39, '사십': 40,
    '사십일': 41, '사십이': 42, '사십삼': 43, '사십사': 44, '사십오': 45, '사십육': 46, '사십칠': 47, '사십팔': 48, '사십구': 49, '오십': 50,
    '오십일': 51, '오십이': 52, '오십삼': 53, '오십사': 54, '오십오': 55, '오십육': 56, '오십칠': 57, '오십팔': 58, '오십구': 59, '육십': 60,
    '천': 1000, '백': 100
}
answerDic = {}


def krWordRankFunc(texts):
    wordrank_extractor = KRWordRank(
        min_count=1,  # 단어의 최소 출현 빈도수 (그래프 생성 시)
        max_length=10,  # 단어의 최대 길이
        verbose=True
    )

    beta = 0.85  # PageRank의 decaying factor beta
    max_iter = 10

    keywords, rank, graph = wordrank_extractor.extract(texts, beta, max_iter)
    return keywords


def findDate(keywords):  # 날짜 확인
    dateStr = ""
    ans, temp = 0, 0
    for comp in keywords:
        if comp.find('년') != -1:
            yearnum = comp[0:comp.find('년')]
            for slicenum in yearnum:
                if slicenum in numberDic:
                    change = numberDic[slicenum]
                    if change == 1000 or change == 100 or change == 10:
                        ans += change if temp == 0 else temp * change
                        temp = 0
                    else:
                        temp = change
            if temp != 0: ans += temp
            if ans != 0:
                dateStr += str(ans) + '년';
    for i in keywords:
        if i.find('월') != -1:
            monthnum = i[0:i.find('월')]
            if (monthnum in numberDic):
                dateStr += str(numberDic[monthnum]) + '월'
    for i in keywords:
        if i.find('일') != -1:
            monthnum = i[0:i.find('일')]
            if (monthnum in numberDic):
                dateStr += str(numberDic[monthnum]) + '일'
    answerDic['날짜'] = dateStr;


def findTime(keywords):  # 시간 확인
    timeStr = ""
    for i in keywords:
        if i.find('시') != -1:
            timenum = i[0:i.find('시')]
            if (timenum in numberDic):
                timeStr += str(numberDic[timenum]) + '시'
    for i in keywords:
        if i.find('분') != -1:
            timenum = i[0:i.find('분')]
            if (timenum in numberDic):
                timeStr += str(numberDic[timenum]) + '분'
    answerDic['시간'] = timeStr;


def findInOut(keywords):  # 입/출항 확인
    for i in keywords:
        if '입항' in i:
            answerDic['입/출항'] = '입항'
        elif '출항' in i:
            answerDic['입/출항'] = '출항'


def findHarborLocation(keywords):  # 외항/내항 확인
    for i in keywords:
        if '외항' in i:
            answerDic['외/내항'] = '외항'
        elif '내항' in i:
            answerDic['외/내항'] = '내항'


def findShipName(keywords, texts):  # 선박명 확인
    splitText = texts[0].split(' ')
    breakPoint = False
    for comp in splitText:
        if breakPoint:
            break;
        if '선박명' in comp:
            breakPoint = True;
    for name in keywords:
        if comp in name or name in comp:
            answerDic['선박명'] = name


def findShipWeight(keywords):  # 총톤수 확인
    ans, temp = 0, 0
    for comp in keywords:
        if comp.find('톤') != -1:
            amountnum = comp[0:comp.find('톤')]
            for slicenum in amountnum:
                if slicenum in numberDic:
                    change = numberDic[slicenum]
                    if change == 1000 or change == 100 or change == 10:
                        ans += change if temp == 0 else temp * change
                        temp = 0
                    else:
                        temp = change
            if temp != 0: ans += temp
            if ans != 0:
                answerDic['총톤수'] = str(ans) + '톤';

def __main__():
    #texts = ["선박명 온두리호 총톤수는 육백삼십이톤이며 이천이십년 팔월 십오일 십삼시 오십분에 울산 외항으로 입항할 예정이다"]
    texts = [normalize(text, english=False, number=False) for text in texts]
    # texts 전처리 영어 미포함, 숫자 미포함 설정

    keywords = krWordRankFunc(texts);

    findInOut(keywords)  # 입/출항 추출 함수
    findHarborLocation(keywords)  # 외/내항 추출 함수
    findDate(keywords)  # 날짜 데이터 추출함수
    findTime(keywords)  # 시간 데이터 추출함수
    findShipName(keywords, texts)  # 선박명 추출함수
    findShipWeight(keywords)  # 총톤수 추출함수
    print(answerDic)

if __name__ == '__main__':
    __main__()