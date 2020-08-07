# 진행상황
***
## 08/01
web을 할 수 있는데 까지 라우팅(모듈화)하였고, '관제정보추가'기능에서 temp db table에서 정보 받아와서 출력, record table로 보낼지 삭제할지 처리하는 기능 구현하였음.

~~혹시 몰라서 기존의 web은 그대로 두고 newweb dir로 올렸음.~~ (web삭제)

**newweb을 실행하는 방법**
1. 우선 main.js가 있는 곳에서 npm install을 cmd에서 타이핑해서 실행.(필요한 모듈 자동 다운로드됨.)
1. mysql을 다운받고 mysql 설정값(비밀번호 등)과 동일하게 config\mysql\db.js를 개인적으로 직접 수정할것.
1. mysql을 실행하여 'ship'이라는 db를 추가.
1. use ship하고 테이블에 들어갈 정보에 맞게 create 'temp'table과 'record'table 하기. 아래 쿼리문 사용.

CREATE TABLE `record`(`id` int NOT NULL AUTO_INCREMENT PRIMARY KEY, `ship_name` varchar(100) NOT NULL, `weight_ton` double NOT NULL, `ship_direction` varchar(30) NOT NULL, `port_position` varchar(30) NOT NULL, `date` varchar(30) NOT NULL, `time` varchar(30) NOT NULL);

CREATE TABLE `temp`(`id` int NOT NULL AUTO_INCREMENT PRIMARY KEY, `ship_name` varchar(100) NOT NULL, `weight_ton` double NOT NULL, `ship_direction` varchar(30) NOT NULL, `port_position` varchar(30) NOT NULL, `date` varchar(30) NOT NULL, `time` varchar(30) NOT NULL);

INSERT INTO record (ship_name, weight_ton, ship_direction, port_position, date, time) VALUES('효동호', 1000, '입항', '내항', '2020-07-11', '20:00');

1. supervisor main.js해서 실행하기.

***

## 08/03
음성파일 텍스트로 변환 및 관제 정보 파싱 후 임시 테이블 temp에 저장하는 기능 추가.
이후 record 테이블로 추가/삭제 가능

<h4>가상환경 구축 방법</h4>
1. bash venv_installation.sh <br>
1. source venv/bin/activate <br>
1. pip install -r requirements.txt <br>

***

## 08/07
**현재까지 총 진행상황 및 코드 실행 상세 방법**
- 진행상황 : record버튼을 눌러 stop을 누르면 녹음이 완료되고 파일이 생성됨, 그러나 parsing부분의 오류 및 녹음파일 상태가 좋지 못한 관계로 table로 만들어지지 않고 error페이지 발생. 그 이후 부분까지는 모두 구현되어 있음.

- 코드실행 방법
1. mysql에 필요한 table 2개를 모두 만들고 새로운 user계정을 꼭 생성한다. (host=localhost, user='gongdae', password='9ghrhks')
 - mysql 접속, 아래 코드 입력
use ship;
create user gongdae@localhost identified by '9ghrhks';
grant all privileges on *.* to gongdae@localhost identified by '9ghrhks';
flush privileges;

1. 가상환경 생성하기
 - ../newweb 에서 실행하며, 08/03자 **가상환경 구축방법**을 그대로 실행하면된다.(grcpio 생성시간 15분 내외로 다소 오래 걸림.)

1. newweb 위치에서 npm install 입력(필요한 모듈 모두 다운로드)

1. sox 를 사용하므로 반드시 다운로드
sudo apt-get install sox libsox-fmt-all

1. ../newweb에서 가상환경 활성화상태에서 홈페이지 실행
 - 코드는 아래와 같다.

source venv/bin/activate
cd newweb
node main.js
종료 시, deactivate 입력

### 유의사항
1. .gitignore에 적힌 항목은 자동적으로 push되지 않는다.
2. 추가적인 npm install (새로운 모듈추가) 발생 시, 반드시 npm install --save (모듈이름) 으로 실행하여 package.json 에 저장되도록 한다.
3. db.js의 db정보를 지금부터는 임의로 바꾸지 않고 정해진 대로 사용한다.
