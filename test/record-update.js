const AliyunDNS = require('../index.js');

const accessKeyId = "<accessKeyId>";
const accessKeySecret = "<accessKeySecret>";
const SubDomain = "<sub.domain.name>";
const Type = "A";
const TargetValue = "1.1.1.1";

(async function () {
    try {
        const client = AliyunDNS.createClient(accessKeyId, accessKeySecret, true);
        console.log(
            await client.UpdateRecordBySubDomain({SubDomain, Type, TargetValue})
        );
    } catch(error) {
        console.log(error);
    }
})();