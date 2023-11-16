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