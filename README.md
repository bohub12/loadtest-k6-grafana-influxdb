# K6로 부하테스트해보기

## K6 설치

```shell
$ brew install k6
```

## Grafana, InfluxDB 연동

```yaml
# docker-compose.yaml

version: "3.7"

services:
  influxdb:
    image: influxdb:1.8
    container_name: influxdb
    ports:
      - "8086:8086"
      - "8085:8088"
    environment:
      - INFLUXDB_DB=mydb
      - INFLUXDB_ADMIN_USER=admin
      - INFLUXDB_ADMIN_PASSWORD=admin
      - INFLUXDB_USER=admin
      - INFLUXDB_USER_PASSWORD=admin

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
```

> Grafana K6
> 대시보드로는 [k6-load-testing-results dashboard](https://grafana.com/grafana/dashboards/2587-k6-load-testing-results/) 가 있다!

## 스크립트 작성 및 실행!

```js
// spike-test.js

import http from 'k6/http';
import {check} from 'k6';

export const options = {
    scenarios: {
        spike: {
            executor: 'constant-vus',
            vus: 300,
            duration: '1s',
        },
    },
};

export default function () {
    const res = http.get('http://localhost:8080/hello');
    check(res, {'success! status 200': (r) => r.status == 200});
};
```

```shell
# 부하거는 쉘 스크립트
$ k6 run --out influxdb=http://localhost:8086/mydb spike-test.js
```

### 메트릭 정보 (자세한 내용은 [공식문서](https://k6.io/docs/using-k6/metrics/) 참고)

#### Built-in metric

|       Metric       |  Type   | Description                                                                                                                                                                                        |
|:------------------:|:-------:|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|        vus         |  Gauge  | Current number of active virtual users                                                                                                                                                             |
|      vus_max	      |  Gauge  | Max possible number of virtual users (VU resources are pre-allocated, to avoid affecting performance when scaling up load )                                                                        |
|     iterations     | Counter | 	The aggregate number of times the VUs execute the JS script (the default function).                                                                                                               |
| iteration_duration |  Trend  | 	The time to complete one full iteration, including time spent in setup and teardown. To calculate the duration of the iteration's function for the specific scenario, try this workaround         | 
| dropped_iterations | Counter | The number of iterations that weren't started due to lack of VUs (for the arrival-rate executors) or lack of time (expired maxDuration in the iteration-based executors). About dropped iterations |
|   data_received    | Counter | The amount of received data. This example covers how to track data for an individual URL.                                                                                                          |
|     data_sent      | Counter | The amount of data sent. Track data for an individual URL to track data for an individual URL.                                                                                                     |
|       checks       |  Rate   | The rate of successful checks.                                                                                                                                                                     |

#### HTTP Built-in metric

|          Metric          |  Type   | Description                                                                                                                                                                                                                               |
|:------------------------:|:-------:|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|        http_reqs         | Counter | 	How many total HTTP requests k6 generated.                                                                                                                                                                                               |
|   http_req_connecting    |  Trend  | 	Time spent establishing TCP connection to the remote host. float                                                                                                                                                                         |
| http_req_tls_handshaking | 	Trend  | 	Time spent handshaking TLS session with remote host                                                                                                                                                                                      |
|     http_req_sending     | 	Trend  | 	Time spent sending data to the remote host. float                                                                                                                                                                                        |
|     http_req_waiting     | 	Trend  | 	Time spent waiting for response from remote host (a.k.a. “time to first byte”, or “TTFB”). float                                                                                                                                         |
|    http_req_receiving    | 	Trend  | 	Time spent receiving response data from the remote host. float                                                                                                                                                                           |
|    http_req_duration     | 	Trend  | 	Total time for the request. It's equal to http_req_sending + http_req_waiting + http_req_receiving (i.e. how long did the remote server take to process the request and respond, without the initial DNS lookup/connection times). float |
|     http_req_failed      |  	Rate  | 	The rate of failed requests according to setResponseCallback.                                                                                                                                                                            |

