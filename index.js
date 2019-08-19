const util = require('util');
const chalk = require('chalk');
const PopCore = require('@alicloud/pop-core');

class Core {
    constructor(accessKeyId, accessKeySecret, debug = false) {
        this.client = new PopCore({
            accessKeyId,
            accessKeySecret,
            endpoint: 'https://alidns.aliyuncs.com',
            apiVersion: '2015-01-09'
        });

        if(debug) {
            this.debug = (operation, params, result) => {
                console.log(chalk.blue(`[${operation}][Params]: \n`), util.inspect(params, true, null, true));
                console.log(chalk.blue(`[${operation}][Result]: \n`), util.inspect(result, true, null, true));
            };
        } else {
            this.debug = () => {};
        }

        [
            // 域名管理接口
            "AddDomain", // 添加域名
            "DeleteDomain", // 删除域名
            "DescribeDomains", // 获取域名列表
            "DescribeDomainInfo", // 获取域名信息
            "ModifyHichinaDomainDNS", // 修改阿里云域名 DNS
            "GetMainDomainName", // 获取主域名名称
            "DescribeDomainLogs", // 获取域名操作日志

            // 云解析产品管理接口
            "DescribeDnsProductInstances", // 获取云解析收费版本产品列表
            "ChangeDomainOfDnsProduct", // 更换云解析产品绑定的域名

            // 域名分组接口
            "AddDomainGroup", // 添加域名分组
            "UpdateDomainGroup", // 修改域名分组
            "DeleteDomainGroup", // 删除域名分组
            "ChangeDomainGroup", // 更换域名分组
            "DescribeDomainGroups", // 获取域名分组列表

            // 域名找回接口
            "CheckDomainRecord", // 检测解析记录是否生效

            // 解析管理接口
            "AddDomainRecord", // 添加解析记录
            "DeleteDomainRecord", // 删除解析记录
            "UpdateDomainRecord", // 修改解析记录
            "SetDomainRecordStatus", // 设置解析记录状态
            "DescribeDomainRecords", // 获取解析记录列表
            "DescribeDomainRecordInfo", // 获取解析记录信息
            "DescribeSubDomainRecords", // 获取子域名解析记录列表
            "DeleteSubDomainRecords", // 删除主机记录对应的解析记录
            "DescribeRecordLogs", // 获取解析操作日志

            // 解析负载均衡接口
            "SetDNSSLBStatus", // 开启/关闭解析负载均衡
            "DescribeDNSSLBSubDomains", // 获取解析负载均衡的子域名列表
            "UpdateDNSSLBWeight", // 修改解析负载均衡权重

            // 批量管理接口
            "DescribeBatchResultCount", // 查询一次批量操作任务的执行结果
            "DescribeBatchResultDetail", // 查询批量处理结果的详细信息
            "OperateBatchDomain", // 提交批量管理域名、解析记录任务
        ].forEach(function (operation) {
            this[operation] = function(params) {
                return new Promise((resolve, reject) => {
                    this.client
                        .request(operation, params, { method: 'POST' })
                        .then((result) => {
                            this.debug(operation, params, result);
                            resolve(result);
                        }, (error) => {
                            this.debug(operation, params, error);
                            reject(error);
                        });
                })
            }
        }.bind(this));
    }

    UpdateRecordBySubDomain(params) {
        let {
            SubDomain, Type = "A", TargetValue
        } = params;

        return new Promise(async (resolve, reject) => {
            try {
                // 获取子域信息
                let domainRecordInfo = await this.DescribeSubDomainRecords({SubDomain, Type});
                
                if(
                    !domainRecordInfo
                    && !domainRecordInfo.DomainRecords
                    && !domainRecordInfo.DomainRecords.Record
                    && !domainRecordInfo.DomainRecords.Record.length != 0
                ) {
                    resolve({
                        Status: false,
                        Message: "Cannot find sub domain infomation"
                    });
                    return;
                }
                
                let { RR, Value, RecordId } = domainRecordInfo.DomainRecords.Record[0];
                if(TargetValue == Value) { 
                    resolve({
                        Status: true,
                        Message: "Target value equle current value"
                    });
                    return;
                }
                
                // 更新域名记录
                let domainRecordUpdateResult = await this.UpdateDomainRecord({
                    RecordId, RR, Type, Value: TargetValue
                });

                if(domainRecordUpdateResult && (domainRecordUpdateResult.RecordId == RecordId)) {
                    resolve({
                        Status: true,
                        Result: { ...domainRecordUpdateResult }
                    });
                    return;
                } else {
                    resolve({
                        Status: false,
                        ...domainRecordUpdateResult
                    });
                    return;
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

function createClient(accessKeyId, accessKeySecret, debug = false) {
    return new Core(accessKeyId, accessKeySecret, debug);
}

module.exports = {
    Core, createClient
}