# 진행상황

###08/01
web을 할 수 있는데 까지 라우팅(모듈화)하였고, '관제정보추가'기능에서 temp db table에서 정보 받아와서 출력, record table로 보낼지 삭제할지 처리하는 기능 구현하였음.

혹시 몰라서 기존의 web은 그대로 두고 newweb dir로 올렸음.

*newweb을 실행하는 방법을 적어둠.
1. 우선 main.js가 있는 곳에서 npm install을 cmd에서 타이핑해서 실행.(필요한 모듈 자동 다운로드됨.)
2. mysql을 다운받고 mysql 설정값(비밀번호 등)과 동일하게 config\mysql\db.js를 개인적으로 직접 수정할것.
3. mysql을 실행하여 'ship'이라는 db를 추가.
4. use ship하고 테이블에 들어갈 정보에 맞게 create 'temp'table과 'record'table 하기. 아래 쿼리문 사용.

CREATE TABLE `record`(`id` int NOT NULL AUTO_INCREMENT PRIMARY KEY, `ship_name` varchar(100) NOT NULL, `weight_ton` double NOT NULL, `ship_direction` varchar(30) NOT NULL, `port_position` varchar(30) NOT NULL, `date` varchar(30) NOT NULL, `time` varchar(30) NOT NULL);

CREATE TABLE `temp`(`id` int NOT NULL AUTO_INCREMENT PRIMARY KEY, `ship_name` varchar(100) NOT NULL, `weight_ton` double NOT NULL, `ship_direction` varchar(30) NOT NULL, `port_position` varchar(30) NOT NULL, `date` varchar(30) NOT NULL, `time` varchar(30) NOT NULL);

5. supervisor main.js해서 실행하기.

###08/03
음성파일 텍스트로 변환 및 관제 정보 파싱 후 임시 테이블 temp에 저장하는 기능 추가.
이후 record 테이블로 추가/삭제 가능

<h4>가상환경 구축 방법</h4>
1. bash venv_installation.sh <br>
2. source venv/bin/activate <br>
3. pip install -r requirements.txt <br>
