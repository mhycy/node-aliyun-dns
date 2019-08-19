# @mhycy/node-aliyun-dns
Aliyun dns api wrapper for node.js

## Install
```console
$ npm install @mhycy/node-aliyun-dns
```

## Usage
```js
const AliyunDNS = require('@mhycy/node-aliyun-dns');

const accessKeyId = "<accessKeyId>";
const accessKeySecret = "<accessKeySecret>";
const client = AliyunDNS.createClient(accessKeyId, accessKeySecret, true);

(async function () {
    let SubDomain = 'test.example.com';
    let Type = 'A';

    let DomainRecord = await client.DescribeSubDomainRecords({SubDomain, Type});
    console.log(DomainRecord);
})();
```

`console.log` output:
```json
{
    "PageNumber": 1,
    "TotalCount": 1,
    "PageSize": 20,
    "RequestId": "02E6E21C-1A27-446B-925F-63502A1F2C9D",
    "DomainRecords": {
        "Record": [
            {
                "RR": "test",
                "Status": "ENABLE",
                "Value": "1.2.3.4",
                "Weight": 1,
                "RecordId": "12345678901234567",
                "Type": "A",
                "DomainName": "example.com",
                "Locked": false,
                "Line": "default",
                "TTL": 600
            }
        ]
    }
}
```

## API
Official API Document see: [云解析 DNS > API文档 > API概览](https://help.aliyun.com/document_detail/29740.html)

### UpdateRecordBySubDomain
Use `SubDomain` to update dns record.

```js
client.UpdateRecordBySubDomain({
    SubDomain: String,
    Type: String|"A",
    TargetValue: String
})
```

Example:
```js
client.UpdateRecordBySubDomain({
    SubDomain: "test.example.com",
    Type: "A",
    TargetValue: "1.2.3.4"
});
```

Return:
```js
// All path
{
    Status: boolean
}

// Update Success
{
    Status: true,
    Result: {
        RecordId: "12345678901234567",
        RequestId: "D80773EC-7C22-44B7-BD34-68A4A4F68BBE"
    }
}

// Haven't update because target value equle current value
{
    Status: true,
    Message: "Target value equle current value"
}

// SubDomain infomation not found
{
    Status: false,
    Message: "SubDomain infomation not found"
}
```